import h5py

def inspect_mat73_file(mat_path):
    with h5py.File(mat_path, 'r') as f:
        def print_attrs(name, obj):
            print(f"{name}: {type(obj)}, shape: {getattr(obj, 'shape', None)}")
        f.visititems(print_attrs)

if __name__ == "__main__":
    import sys
    if len(sys.argv) < 2:
        print("Usage: python inspect_mat73.py <mat_file>")
    else:
        inspect_mat73_file(sys.argv[1])
