#pragma once
#include <opencv2/opencv.hpp>
#include <mutex>

#ifndef IMAGEPROCESSOR_H
#define IMAGEPROCESSOR_H

extern bool isTriggerMode;
extern bool isCropMode;
// =====================
// ImageManager-Klasse
// =====================
class ImageProcessor {
    public:
        void setLatestImage(const cv::Mat& image);
        cv::Mat getLatestImage();

        void setHeatMap(const cv::Mat& map);
        cv::Mat getHeatMap();

        void userInput();

        [[nodiscard]] double calcHomogen(const cv::Mat &image) const;
        [[nodiscard]] uchar calcMaxGW(const cv::Mat &image) const;
        void calcSetExposure(uchar maxGW, void* handle) const;
        void calibrateExposure(void* handle, const ImageProcessor& iP) const;
        [[nodiscard]] cv::Mat generateHeatmap(const cv::Mat &latestImage) const;
        [[nodiscard]] cv::Mat valWindow(double hmg, uchar meanGW, uchar maxGW) const;
        [[nodiscard]] cv::Rect2d cropImage(cv::Mat const &image) const;
    private:
        cv::Mat latestImage;
        cv::Mat heatMap;
        std::mutex imageMutex;
        char input = 0;
};

#endif //IMAGEPROCESSOR_H
