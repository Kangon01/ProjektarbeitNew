#include "CameraController.h"
#include "ImageProcessor.h"

#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>
#undef byte                 // Durch Überschneidungen von typedef "byte" in mehreren header Dateien

#include <opencv2/opencv.hpp>
#include <cstdio>
#include <MvCameraControl.h>
#include <thread>

using namespace cv;
using namespace std;

// Globale Steuerung
bool exitProg = false;
bool isTriggerMode = false;
bool isCropMode = false;
// =====================
// ImageProzessor
// =====================
ImageProcessor iP;

// =====================
// WorkThread – Bildaufnahme und Vorverarbeitung
// =====================
static unsigned __stdcall WorkThread(void* pUser) {
    void* handle = pUser;
    MV_FRAME_OUT stImageInfo = {nullptr};

    while (!exitProg) {
        const int ret = MV_CC_GetImageBuffer(handle, &stImageInfo, 1000);
        if (ret == MV_OK) {
            const int width = stImageInfo.stFrameInfo.nWidth;
            const int height = stImageInfo.stFrameInfo.nHeight;

            // Erstellt ein Graustufenbild aus dem Kamerapuffer
            Mat image(height, width, CV_8UC1, stImageInfo.pBufAddr);
            if (image.empty()) {
                fprintf(stderr, "Error: No Image found!");
                exit(EXIT_FAILURE);
            }
            printf("Frame..\n");

            // Passt die größe des Bildes auf 40 % an und speichert das Bild
            resize(image, image, Size(), 0.4, 0.4, INTER_AREA);

            // Schneidet das Bild zu, wenn cropMode an ist
            static Rect2d roi(0,0, image.cols, image.rows);
            if (isCropMode) {
                roi = iP.cropImage(image);
                if (roi.width <= 0 || roi.height <= 0) {
                    fprintf(stderr, "Error: Invalid ROI returned!\n");
                    exit(EXIT_FAILURE);
                }
                isCropMode = false;
            }
            iP.setLatestImage(image(roi));


            // Erstellt eine Heatmap und speichert sie ab
            Mat heatMap = iP.generateHeatmap(iP.getLatestImage());
            if (heatMap.empty()) {
                fprintf(stderr, "Error: No heat map found!");
                exit(EXIT_FAILURE);
            }
            iP.setHeatMap(heatMap);

            MV_CC_FreeImageBuffer(pUser, &stImageInfo);
        }
    }
    return 0;
}

// =====================
// Hauptprogramm
// =====================
int main() {
    CameraController camera("172.29.37.2","172.29.37.1");
    if (!camera.open()) {
        fprintf(stderr, "Error: Opening Camera failed!\n");
        exit(EXIT_FAILURE);
    }

    iP.userInput();

    int triggerMode;
    (isTriggerMode) ? triggerMode = 0 : triggerMode = 2;

    if (!camera.setModes(triggerMode, isTriggerMode)) {
        fprintf(stderr, "Error: Set Modes failed!");
        exit(EXIT_FAILURE);
    }

    if (!camera.startGrabbing()) {
        fprintf(stderr, "Error: Starting Grabbing failed!");
        exit(EXIT_FAILURE);
    }

    // =====================
    // Bildausgabe (Graubild / Heatmap)
    // =====================
    try {
        // Unterdrückt die Info-Logs
        setLogLevel(utils::logging::LogLevel::LOG_LEVEL_ERROR);
        thread worker(WorkThread, camera.getHandle());
        printf("Work-Thread successfully started..\n");

        // Warte, solang wie die Heatmap leer ist, um fehler zu vermeiden
        int waited = 0;
        while (iP.getHeatMap().empty()) {
            Sleep(10);
            waited += 10;
        }


        // Zeigt die Bilder an
        while (!exitProg) {
            static int hmg = 0;
            static uchar meanGW = 0;
            static uchar maxGW = 0;

            Mat currentImage = iP.getLatestImage();
            Mat currentHeatMap = iP.getHeatMap();

            meanGW = mean(iP.getLatestImage())[0];
            maxGW = iP.calcMaxGW(currentImage);
            Mat valWindow = iP.valWindow(hmg, meanGW, maxGW);

            if (!currentImage.empty()) {
                hmg = iP.calcHomogen(currentImage);
                imshow("Captured Image", currentImage);
            }
            else {
                fprintf(stderr, "Error: No Image found to present!");
                exit(EXIT_FAILURE);
            }

            if (!currentHeatMap.empty()) {
                imshow("HeatMap", currentHeatMap);
            }
            else {
                fprintf(stderr, "Error: No Heatmap found to present!");
            }

            if (!valWindow.empty()) {
                imshow("Status:", valWindow);
            }
            else {
                fprintf(stderr, "Error: No ValWindow found to present!");
                exit(EXIT_FAILURE);
            }
            const int key = waitKey(1);
            if (key == 27) { // ESC drücken zum Beenden
                exitProg = true;
            }
        }

        worker.join();
        destroyAllWindows();
    }
    catch (const system_error &e){
        fprintf(stderr, "Error: Thread could not be generated: %s\n", e.what());
    }

    if (!camera.close()) {
        fprintf(stderr, "Error: Closing Camera failed!");
        exit(EXIT_FAILURE);
    }
    MV_CC_Finalize();
    exit(EXIT_SUCCESS);
}

