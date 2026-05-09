# Contributing to Microanomalies Detection System

Thank you for your interest in contributing to this project! This guide will help you get started.

## 🤝 How to Contribute

### Reporting Bugs

1. **Search existing issues** before creating a new one
2. **Use the bug report template** and provide:
   - Clear description of the issue
   - Steps to reproduce
   - Expected vs actual behavior
   - Environment details (OS, Python version, etc.)
   - Relevant logs or screenshots

### Suggesting Features

1. **Check the roadmap** in README.md for planned features
2. **Open a feature request** with:
   - Clear use case description
   - Proposed implementation approach
   - Potential benefits to users

### Code Contributions

#### 1. Setup Development Environment

```bash
git clone https://github.com/BodanampatiMohith/Microanamoly-Detection.git
cd Microanamoly-Detection
bash setup.sh

# Install development dependencies
pip install -r requirements-dev.txt
npm install --dev
```

#### 2. Create a Feature Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

#### 3. Make Your Changes

- **Follow the existing code style**
- **Add tests** for new functionality
- **Update documentation** as needed
- **Ensure all tests pass**

#### 4. Test Your Changes

```bash
# Run backend tests
cd backend
python -m pytest tests/

# Run frontend tests
cd frontend
npm test

# Run integration tests
python test_integration.py
```

#### 5. Submit Your Pull Request

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** with:
   - Clear title and description
   - Reference related issues
   - Screenshots if applicable
   - Testing instructions

## 📝 Code Style Guidelines

### Python (Backend)

- **Follow PEP 8** style guidelines
- **Use type hints** for function signatures
- **Write docstrings** for all public functions/classes
- **Limit line length** to 88 characters

```python
def process_frame(
    frame: np.ndarray, 
    config: Dict[str, Any]
) -> Tuple[np.ndarray, Dict[str, float]]:
    """
    Process a single video frame using EVM pipeline.
    
    Args:
        frame: Input video frame as numpy array
        config: Configuration dictionary for EVM parameters
        
    Returns:
        Tuple of (amplified_frame, metrics)
        
    Raises:
        ValueError: If frame dimensions are invalid
    """
    pass
```

### JavaScript/React (Frontend)

- **Use ES6+ syntax**
- **Follow React best practices**
- **Use functional components** with hooks
- **Add PropTypes** or TypeScript interfaces

```jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const VideoProcessor = ({ videoSource, onProcessComplete }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  
  useEffect(() => {
    // Component logic
  }, [videoSource]);
  
  return (
    <div className="video-processor">
      {/* JSX content */}
    </div>
  );
};

VideoProcessor.propTypes = {
  videoSource: PropTypes.string.isRequired,
  onProcessComplete: PropTypes.func.isRequired
};

export default VideoProcessor;
```

## 🧪 Testing Guidelines

### Backend Tests

- **Unit tests** for individual functions
- **Integration tests** for API endpoints
- **Performance tests** for critical paths

```python
import pytest
import numpy as np
from src.evm.evm_pipeline import EVMPipeline

class TestEVMPipeline:
    def setup_method(self):
        self.pipeline = EVMPipeline()
        self.test_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    
    def test_amplify_motion(self):
        result = self.pipeline.amplify_motion(self.test_frame)
        assert result.shape == self.test_frame.shape
        assert result.dtype == self.test_frame.dtype
```

### Frontend Tests

- **Component tests** using React Testing Library
- **Integration tests** for user workflows
- **Visual regression tests** for UI components

```jsx
import { render, screen, fireEvent } from '@testing-library/react';
import VideoUpload from '../components/VideoUpload';

describe('VideoUpload', () => {
  test('handles file selection', () => {
    const onUpload = jest.fn();
    render(<VideoUpload onUpload={onUpload} />);
    
    const fileInput = screen.getByLabelText('Upload video');
    const file = new File(['test'], 'test.mp4', { type: 'video/mp4' });
    
    fireEvent.change(fileInput, { target: { files: [file] } });
    expect(onUpload).toHaveBeenCalledWith(file);
  });
});
```

## 📚 Documentation

### Updating Documentation

- **README.md**: Project overview, setup, and usage
- **architecture.md**: Technical architecture details
- **API docs**: Endpoint documentation with examples
- **Code comments**: Complex algorithms and business logic

### Documentation Style

- **Use clear, concise language**
- **Include code examples**
- **Add diagrams** where helpful (Mermaid preferred)
- **Keep documentation in sync** with code changes

## 🏗️ Project Structure

```
backend/
├── src/
│   ├── evm/           # EVM processing modules
│   ├── signal/        # Signal processing
│   ├── anomaly/       # Anomaly detection
│   ├── monitoring/    # Telemetry and logging
│   └── utils/         # Utility functions
├── tests/             # Backend tests
└── requirements.txt   # Dependencies

frontend/
├── src/
│   ├── components/    # React components
│   ├── pages/        # Page components
│   ├── utils/        # Frontend utilities
│   └── styles/       # CSS stylesheets
├── tests/            # Frontend tests
└── package.json      # Dependencies
```

## 🔄 Development Workflow

### 1. Before Starting

- **Check existing issues** and PRs
- **Discuss major changes** in an issue first
- **Ensure your idea aligns** with project goals

### 2. During Development

- **Commit frequently** with clear messages
- **Write tests as you code**
- **Update documentation** alongside code changes
- **Run tests locally** before pushing

### 3. Before Submitting

- **Rebase** your branch if needed
- **Ensure all tests pass**
- **Check code coverage**
- **Update CHANGELOG.md** if applicable

## 📋 Pull Request Template

```markdown
## Description
Brief description of changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated

## Related Issues
Closes #123
```

## 🎯 Areas for Contribution

### High Priority
- **GPU acceleration** for EVM processing
- **Additional ML models** for anomaly detection
- **Performance optimization** for real-time processing
- **Comprehensive test coverage**

### Medium Priority
- **Mobile responsive design**
- **Additional video format support**
- **Advanced analytics features**
- **Internationalization**

### Low Priority
- **Plugin system** for custom detectors
- **Cloud deployment templates**
- **Advanced visualization options**
- **Audio processing integration**

## 🏆 Recognition

Contributors will be:
- **Listed in README.md** under contributors section
- **Mentioned in release notes** for significant contributions
- **Invited to become maintainers** for consistent, high-quality contributions

## 📞 Getting Help

- **Discussions**: Use GitHub Discussions for questions
- **Issues**: Report bugs or request features
- **Email**: Contact maintainers for sensitive issues

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Thank you for contributing to the Microanomalies Detection System! 🎉**
