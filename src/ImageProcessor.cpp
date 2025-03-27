#include "ImageProcessor.h"

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

    Mat legende = imread("C:/Users/nschmitz/CLionProjects/Projektarbeit1/Legende.png");
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
