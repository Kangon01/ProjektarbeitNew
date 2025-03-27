
## =====================
## CMakeList
## =====================

cmake_minimum_required(VERSION 3.20)
project(ProjektarbeitNew)
set(CMAKE_CXX_STANDARD 17)

## =====================
## OpenCV-Dir
## =====================

set(OpenCV_DIR "${CMAKE_SOURCE_DIR}/sdks/opencv/build")
set(CMAKE_MODULE_PATH ${CMAKE_MODULE_PATH} "${CMAKE_SOURCE_DIR}/cmake/")

## =====================
## Includes
## =====================
find_package(OpenCV REQUIRED)
include_directories(SYSTEM "${CMAKE_SOURCE_DIR}/sdks/opencv/build/include")
include_directories(SYSTEM "${CMAKE_SOURCE_DIR}/sdks/MVS/Development/Includes")
include_directories("${CMAKE_SOURCE_DIR}/include")
## =====================
## Executables
## =====================

add_executable(
    Projektarbeit1 main.cpp
        include/CameraController.h
        src/CameraController.cpp
        include/ImageProcessor.h
        src/ImageProcessor.cpp
)

## =====================
## Libaries
## =====================

# OPENCV LIBARIES
target_link_libraries(Projektarbeit1 ${OpenCV_LIBS})

# MVS- / HIKROBOT-LIBARIES
target_link_libraries(Projektarbeit1 "${CMAKE_SOURCE_DIR}/sdks/MVS/Development/Libraries/win64/MvCameraControl.lib")


