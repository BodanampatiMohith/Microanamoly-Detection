import scipy.io

# Print variable names and shapes in a .mat file
def inspect_mat_file(mat_path):
    mat = scipy.io.loadmat(mat_path)
    for k, v in mat.items():
        if not k.startswith('__'):
            print(f"{k}: {type(v)}, shape: {getattr(v, 'shape', None)}")

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python inspect_mat.py <mat_file>")
    else:
        inspect_mat_file(sys.argv[1])
