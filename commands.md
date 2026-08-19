//------Create Virtual Environment------//
python -m venv venv 
//------Activate karo-------------------//
.\venv\Scripts\activate
//------Update pip---------------------//
python -m pip install --upgrade pip
//------Install YOLO-------------------//
pip install ultralytics
//------Install OpenCV-----------------//
pip install opencv-python

pip install fastapi uvicorn[standard]
pip install chromadb sentence-transformers