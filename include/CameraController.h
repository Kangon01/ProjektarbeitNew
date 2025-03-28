#pragma once
#include "MvCameraControl.h"
#include <string>
#include <opencv2/opencv.hpp>
#ifndef CAMERACONTROLLER_HPP
#define CAMERACONTROLLER_HPP

using namespace std;

class CameraController {
    public:
        CameraController(const string& currentIp, const string& netExport);

        [[nodiscard]] bool open();
        [[nodiscard]] bool setModes(int mode, bool isTriggerMode) const;
        [[nodiscard]] bool startGrabbing() const;
        void displayAll(const cv::Mat &currentImage, const cv::Mat &currentHeatMap, const cv::Mat &valWindow) const;
        [[nodiscard]] bool close() const;
        [[nodiscard]] void* getHandle() const;
    private:
        void *handle;
        MV_CC_DEVICE_INFO stDevInfo{};
        MV_GIGE_DEVICE_INFO stGigEDev{};
        string currentIp;
        string netExport;

        MV_GIGE_DEVICE_INFO formatIp(const char* nCurrentIp, const char* nNetExport);
};

#endif