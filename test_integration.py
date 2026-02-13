#!/usr/bin/env python
"""
Integration test for the microanomalies detection system.
"""
import cv2
import base64
import json
import urllib.request

print("Testing Microanomalies Detection System...")

# Test 1: Check backend health
print("\n1. Testing backend health...")
try:
    req = urllib.request.Request('http://localhost:5000/api/health')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read())
        if result.get('status') == 'healthy':
            print("   ✓ Backend is healthy")
        else:
            print("   ✗ Backend health check failed")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 2: Get configuration
print("\n2. Testing configuration endpoint...")
try:
    req = urllib.request.Request('http://localhost:5000/api/config')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read())
        evm_levels = result.get('evm', {}).get('num_levels')
        print(f"   ✓ Config loaded (EVM levels: {evm_levels})")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 3: Get ROI
print("\n3. Testing ROI endpoint...")
try:
    req = urllib.request.Request('http://localhost:5000/api/roi')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read())
        roi = result.get('roi', {})
        print(f"   ✓ ROI retrieved: {roi}")
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 4: Process a frame
print("\n4. Testing frame processing...")
try:
    # Capture a frame from webcam
    cap = cv2.VideoCapture(0)
    ret, frame = cap.read()
    cap.release()
    
    if ret:
        # Resize frame
        frame = cv2.resize(frame, (320, 240))
        
        # Encode to base64
        _, buffer = cv2.imencode('.jpg', frame)
        frame_b64 = base64.b64encode(buffer).decode()
        
        # Create request
        payload = json.dumps({
            'image': 'data:image/jpeg;base64,' + frame_b64,
            'roi': {'x': 10, 'y': 10, 'width': 100, 'height': 100}
        })
        
        req = urllib.request.Request(
            'http://localhost:5000/api/process_frame',
            data=payload.encode(),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read())
            status = result.get('anomaly_detection', {}).get('status', 'Unknown')
            index = result.get('anomaly_detection', {}).get('anomaly_index', 0)
            print(f"   ✓ Frame processed successfully")
            print(f"     - Status: {status}")
            print(f"     - Anomaly Index: {index:.3f}")
            print(f"     - Features: {len(result.get('features', {}))} extracted")
    else:
        print("   ⚠ Could not capture frame (webcam may not be available)")
        
except Exception as e:
    print(f"   ✗ Error: {e}")

# Test 5: Get statistics
print("\n5. Testing statistics endpoint...")
try:
    req = urllib.request.Request('http://localhost:5000/api/statistics')
    with urllib.request.urlopen(req) as response:
        result = json.loads(response.read())
        frame_count = result.get('frame_count', 0)
        print(f"   ✓ Statistics retrieved (Frames processed: {frame_count})")
except Exception as e:
    print(f"   ✗ Error: {e}")

print("\n" + "="*50)
print("Integration test complete!")
print("="*50)
