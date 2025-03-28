#define WIN32_LEAN_AND_MEAN
#define NOMINMAX
#include <Windows.h>
#undef byte

#include <cstdio>
#include <opencv2/opencv.hpp>
#include "CameraController.h"

// =====================
// CameraController mit Managementfunktionen
// =====================

typedef CameraController cc;

cc::CameraController(const string &currentIp, const string &netExport): handle(nullptr), currentIp(currentIp), netExport(netExport) {

    // Kamera- und Netzwerk-IP konfigurieren
    memset(&stDevInfo, 0, sizeof(stDevInfo));
    memset(&stGigEDev, 0, sizeof(stGigEDev));

    stDevInfo.nTLayerType = MV_GIGE_DEVICE;
    stGigEDev = formatIp(currentIp.c_str(), netExport.c_str());
    stDevInfo.SpecialInfo.stGigEInfo = stGigEDev;
}

bool cc::open() {
    int nRet = MV_CC_Initialize();
    if (MV_OK != nRet) {
        fprintf(stderr, "Initializing SDK failed!\n");
        return false;
    }
    nRet = MV_CC_CreateHandle(&handle, &stDevInfo);
    if (MV_OK != nRet) {
        fprintf(stderr, "Creating handle failed!\n");
        return false;
    }
    nRet = MV_CC_OpenDevice(handle);
    if (MV_OK != nRet) {
        printf("Failed to open device!\n");
        return false;
    }
    printf("Device opened successfully!\n");
    return true;
}
bool cc::setModes(const int mode, const bool isTriggerMode) const {
    // Setzt die optimale Paketgröße (bei GigE)
    if (stDevInfo.nTLayerType == MV_GIGE_DEVICE) {
        const int nPacketSize = MV_CC_GetOptimalPacketSize(handle);
        if (nPacketSize > 0) {
            const int nRet = MV_CC_SetIntValueEx(handle, "GevSCPSPacketSize", nPacketSize);
            if (nRet != MV_OK) {
                fprintf(stderr, "Error: Setting Packet-Size failed!");
                return false;
            }
        } else {
            fprintf(stderr, "Error: Acquiring Packet Size failed!");
            return false;
        }
    }

    // Setzt den Aufnahmemodus
    int nRet = MV_CC_SetEnumValue(handle, "AcquisitionMode", mode);
    if (MV_OK != nRet)
    {
        fprintf(stderr, "Set Acquisition Mode failed!\n");
        return false;
    }

    // Setzt den Triggermodus je nach Benutzereingabe auf "On" oder "Off"
    string trigger;
    int strobeDuration;
    isTriggerMode ? trigger.assign("On") : trigger.assign("Off");
    !isTriggerMode ? strobeDuration = 50000 : strobeDuration = 0;

    nRet = MV_CC_SetEnumValueByString(handle, "TriggerMode", "Off");
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Trigger Mode failed!\n");
        return false;
    }

    // Trigger-Einstellungen
    nRet = MV_CC_SetEnumValueByString(handle, "TriggerSource", "Software");
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Trigger Source failed!\n");
        return false;
    }
    nRet = MV_CC_SetEnumValueByString(handle, "LineSelector", "Line1");
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Line Selector failed!\n");
        return false;
    }
    nRet = MV_CC_SetEnumValueByString(handle, "LineSource", "ExposureStartActive");
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Line Source failed!\n");
        return false;
    }

    // Flash-Einstellungen
    nRet = MV_CC_SetBoolValue(handle, "StrobeEnable", true);
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Strobe Enable failed!\n");
        return false;
    }
    nRet = MV_CC_SetIntValueEx(handle, "StrobeLineDuration", strobeDuration);
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Strobe Line Duration failed!\n");
        return false;
    }
    nRet = MV_CC_SetIntValueEx(handle, "StrobeLineDelay", 0);
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Strobe Line Delay failed!\n");
        return false;
    }
    nRet = MV_CC_SetIntValueEx(handle, "StrobeLinePreDelay", 0);
    if (MV_OK != nRet) {
        fprintf(stderr, "Set Strobe Line Pre-Delay failed!\n");
        return false;
    }
    return true;
}
bool cc::startGrabbing() const {
    const int nRet = MV_CC_StartGrabbing(handle);
    if (MV_OK != nRet) {
        fprintf(stderr, "Start Grabbing fail!");
        return false;
    }
    printf("Start Grabbing successful!\n\n");
    return true;
}
void cc::displayAll(const cv::Mat &currentImage, const cv::Mat &currentHeatMap, const cv::Mat &valWindow) const {
    if (!currentImage.empty()) {
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
        exit(EXIT_FAILURE);
    }

    if (!valWindow.empty()) {
        imshow("Status:", valWindow);
    }
    else {
        fprintf(stderr, "Error: No ValWindow found to present!");
        exit(EXIT_FAILURE);
    }
}
bool cc::close() const {
    int nRet = MV_CC_StopGrabbing(handle);
    if (MV_OK != nRet)
    {
        fprintf(stderr, "Stop Grabbing failed!\n");
        return false;
    }
    nRet = MV_CC_CloseDevice(handle);
    if (MV_OK != nRet)
    {
        fprintf(stderr, "Closing Device failed!\n");
        return false;
    }
    nRet = MV_CC_DestroyHandle(handle);
    if (MV_OK != nRet)
    {
        fprintf(stderr, "Destroying Handle failed!\n");
        return false;
    }
    printf("Closed Device successfully!");
    return true;
}
void* cc::getHandle() const {
    return handle;
}

MV_GIGE_DEVICE_INFO cc::formatIp(const char* nCurrentIp, const char* nNetExport) {
    // Formatiert die IP-Adressen in das richtige Format für stGigEDev
    unsigned int nIp1, nIp2, nIp3, nIp4;

    sscanf_s(nCurrentIp, "%u.%u.%u.%u", &nIp1, &nIp2, &nIp3, &nIp4);
    unsigned int nIp = (nIp1 << 24) | (nIp2 << 16) | (nIp3 << 8) | nIp4;
    stGigEDev.nCurrentIp = nIp;

    sscanf_s(nNetExport, "%u.%u.%u.%u", &nIp1, &nIp2, &nIp3, &nIp4);
    nIp = (nIp1 << 24) | (nIp2 << 16) | (nIp3 << 8) | nIp4;
    stGigEDev.nNetExport = nIp;

    return stGigEDev;
}