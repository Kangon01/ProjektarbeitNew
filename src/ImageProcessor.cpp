#include "ImageProcessor.h"
#include <MvCameraControl.h>
#include "CameraController.h"

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>
#undef byte
#undef max();

using namespace cv;
using namespace std;

typedef ImageProcessor iP;

// Zurückgeben und Speichern von image
void iP::setLatestImage(const Mat &image) {
    lock_guard lock(imageMutex);
    latestImage = image.clone();
}
Mat iP::getLatestImage() {
    lock_guard lock(imageMutex);
    return latestImage.clone();
}

// Zurückgeben und Speichern von map (Heatmap)
void iP::setHeatMap(const Mat &map) {
    lock_guard lock(imageMutex);
    heatMap = map.clone();
}
Mat iP::getHeatMap() {
    lock_guard lock(imageMutex);
    return heatMap;
}

void iP::userInput() {
    do {
        cout << "Live-Feed < l > oder TriggerBild < t > ?" << endl;
        cin >> input;
    } while (input != 'l' && input != 't');
    isTriggerMode = (input == 't');

    cin.ignore(numeric_limits<streamsize>::max(), '\n');

    do {
        cout << "Moechten sie das Bild zurechtschneiden? < y / n >" << endl;
        cin >> input;
    } while (input != 'y' && input != 'n');
    isCropMode = (input == 'y');
}

double iP::calcHomogen(const Mat &image) const {
    Scalar meanVal, stddevVal;
    meanStdDev(image, meanVal, stddevVal);
    //Je kleiner die Standardabweichung zum relativen Mittelwert ist, desto homogener ist das Licht.
    double homogen = (1 - (stddevVal[0] / meanVal[0])) * 100;
    if (homogen < 0) homogen = 0;

    return homogen;
}
uchar iP::calcMaxGW(const Mat &image) const {
    uchar maxGW = 0;
    for (int x = 0; x < image.rows; x++) {
        for (int y = 0; y < image.cols; y++) {
            const uchar pixel = image.at<uchar>(x,y);
            if (pixel > maxGW) maxGW = pixel;
        }
    }
    return maxGW;
}
void iP::calcSetExposure(const uchar maxGW, void* handle) const {
    static float exposure = 0;
    if (exposure == 0) {
        constexpr float defaultExposure = 300.0f;
        const int nRet = MV_CC_SetFloatValue(handle, "ExposureTime", defaultExposure);
        exposure = (nRet == MV_OK) ? defaultExposure : 300.0f;
    }

    constexpr float target = 200.0f;
    const float error = target - maxGW;

    constexpr float deadband = 1.0f;
    if (fabs(error) < deadband) {
        printf("Deadband aktiv: Kein Update (Fehler = %.2f)\n", error);
        return;
    }

    constexpr float Kp = 1.2f;

    exposure += error * Kp;

    // Definiere gültige Grenzen in μs
    constexpr float minExposure = 15.0f;
    constexpr float maxExposure = 10e6;

    if (exposure < minExposure) {
        exposure = minExposure;
        printf("Warnung: Exposure auf Minimalwert begrenzt (%f mikros), da berechneter Wert zu niedrig ist.\n", minExposure);
    } else if (exposure > maxExposure) {
        exposure = maxExposure;
        printf("Warnung: Exposure auf Maximalwert begrenzt (%f mikros), da berechneter Wert zu hoch ist.\n", maxExposure);
    }
    printf("< exp: %.2f mikro/s: %d error: %.2f >\n", exposure, maxGW, error);
    const int nRet = MV_CC_SetFloatValue(handle, "ExposureTime", exposure);
    if (MV_OK != nRet) {
        fprintf(stderr, "Set ExposureTime failed!\n");
        exit(EXIT_FAILURE);
    }
}

void iP::calibrateExposure(void *handle, const ImageProcessor &iP) const {
    constexpr int maxAttempts = 100;
    int attempt = 0;
    while (attempt < maxAttempts) {
        MV_FRAME_OUT stImageInfo = {nullptr};
        const int ret = MV_CC_GetImageBuffer(handle, &stImageInfo, 1000);
        if (MV_OK == ret) {
            const int width = stImageInfo.stFrameInfo.nWidth;
            const int height = stImageInfo.stFrameInfo.nHeight;
            Mat image(height, width, CV_8UC1, stImageInfo.pBufAddr);
            if (image.empty()) {
                fprintf(stderr, "Error: Kein Bild für calExp gefunden!\n");
                exit(EXIT_FAILURE);
            }
            uchar currentMaxGW = iP.calcMaxGW(image);
            if (currentMaxGW == 200) {
                MV_CC_FreeImageBuffer(handle, &stImageInfo);
                break;
            }
            calcSetExposure(currentMaxGW, handle);

            MV_CC_FreeImageBuffer(handle, &stImageInfo);
        }
        else {
            fprintf(stderr, "Error: Kein Bild mit dem GW von 200 gefunden!");
        }
        ++attempt;
        Sleep(50);
    }
}
Mat iP::generateHeatmap(const Mat &latestImage) const {
    Scalar meanVal, stddevVal;
    meanStdDev(latestImage, meanVal, stddevVal);
    const double mittel = meanVal[0];
    const double standard = stddevVal[0];

    Mat deviationMap = Mat::zeros(latestImage.size(), CV_8UC1);
    for (int y = 0; y < latestImage.rows; y++) {
        for (int x = 0; x < latestImage.cols; x++) {
            const double pixelValue = latestImage.at<uchar>(y, x);
            const double deviation = abs(pixelValue - mittel);
            deviationMap.at<uchar>(y, x) = saturate_cast<uchar>(deviation * 255 / (2.5 * standard));
        }
    }
    if (deviationMap.empty()) {
        fprintf(stderr, "Error: DeviationMap is not found!\n");
        exit(EXIT_FAILURE);
    }

    Mat heatMap;
    applyColorMap(deviationMap, heatMap, COLORMAP_JET);
    if (heatMap.empty()) {
        fprintf(stderr, "Error: Generating Heatmap failed\n");
        exit(EXIT_FAILURE);
    }

    return heatMap;
}
Mat iP::valWindow(const double hmg, const uchar meanGW, const uchar maxGW) const {
    Mat statsImage = Mat::zeros(400, 300, CV_8UC3);

    // Passt die Nachkommastellen auf 2 an
    std::ostringstream strHmg;
    strHmg.precision(2);
    strHmg << hmg;

    const vector<string> stats = {
        "Homogenitaet: " + strHmg.str() + "%",
        "Mittlerer Grauwert: " + to_string(meanGW),
        "Maximaler Grauwert: " + to_string(maxGW)
    };

    int y = 30;
    for (const auto &line : stats) {
        putText(statsImage, line, Point(10, y), FONT_HERSHEY_SIMPLEX, 0.7, Scalar(255, 255, 255), 1, LINE_AA);
        y += 30;
    }

    Mat legende = imread("C:/Users/nschmitz/CLionProjects/Projektarbeit_1/Legende.png");
    if (legende.empty()) {
        printf("Legende not found\n");
        exit(EXIT_FAILURE);
    }
    resize(legende, legende, Size(170, statsImage.rows), 0.4, 0.4, INTER_AREA);

    Mat finalImage;
    hconcat(statsImage, legende, finalImage);
    return finalImage;
}
Rect2d iP::cropImage(Mat const &image) const {
    const Rect2d roi = selectROI("Waehle den gewuenschten Bereich aus!", image);
    destroyWindow("Waehle den gewuenschten Bereich aus!");
    return roi;
}
