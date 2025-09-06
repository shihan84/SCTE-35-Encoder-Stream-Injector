# Contributing to SCTE-35 Encoder & Stream Injector

Thank you for your interest in contributing to the SCTE-35 Encoder & Stream Injector project! This document provides guidelines and instructions for contributors.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Documentation Guidelines](#documentation-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)

## 🤝 Code of Conduct

This project adheres to the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of TypeScript, React, and Next.js

### Setup

1. **Fork the repository**
   ```bash
   # Fork the repository on GitHub
   git clone https://github.com/YOUR_USERNAME/scte35-encoder.git
   cd scte35-encoder
   ```

2. **Set up your development environment**
   ```bash
   # Install dependencies
   npm install
   
   # Copy environment variables
   cp .env.example .env.local
   
   # Start the development server
   npm run dev
   ```

3. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 🔄 Development Workflow

### 1. Planning

- Check the [GitHub Issues](https://github.com/your-username/scte35-encoder/issues) for existing tasks
- Create a new issue for your feature or bug fix
- Discuss the implementation approach in the issue comments

### 2. Development

- Create a new branch from `main`
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/your-feature-name
   ```

- Implement your changes following the [Coding Standards](#coding-standards)
- Write tests for your changes
- Update documentation as needed

### 3. Testing

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests
npm run test:integration

# Run end-to-end tests
npm run test:e2e

# Run linting
npm run lint

# Type checking
npm run type-check
```

### 4. Committing Changes

- Follow the [Conventional Commits](https://www.conventionalcommits.org/) format
- Use meaningful commit messages
- Include issue numbers when applicable

```bash
# Good commit messages
git commit -m "feat(scte35): add support for segmentation descriptors"
git commit -m "fix(stream): resolve memory leak in stream processing"
git commit -m "docs(readme): update installation instructions"
git commit -m "test(encoder): add unit tests for splice insert encoding"
```

### 5. Pull Request

1. **Push your branch**
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request**
   - Go to the repository on GitHub
   - Click "New Pull Request"
   - Select your branch as the source
   - Write a clear description of your changes
   - Link to any related issues

3. **Review Process**
   - Your PR will be reviewed by maintainers
   - Address any feedback or requested changes
   - Ensure all CI checks pass
   - Wait for approval and merge

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode in `tsconfig.json`
- Provide proper type annotations
- Use interfaces over type aliases when possible

```typescript
// Good
interface SCTE35Command {
  spliceEventId: number;
  outOfNetworkIndicator: boolean;
  programSpliceFlag: boolean;
}

// Avoid
type SCTE35Command = {
  spliceEventId: number;
  outOfNetworkIndicator: boolean;
  programSpliceFlag: boolean;
};
```

### React/Next.js

- Use functional components with hooks
- Prefer composition over inheritance
- Use TypeScript interfaces for props
- Follow the official React patterns

```typescript
// Good
interface EncoderProps {
  config: StreamConfig;
  onEncode: (data: SCTE35Data) => void;
}

const Encoder: React.FC<EncoderProps> = ({ config, onEncode }) => {
  // Component implementation
};
```

### API Routes

- Use TypeScript for request/response types
- Implement proper error handling
- Validate input data
- Use appropriate HTTP status codes

```typescript
// Good
import { NextRequest, NextResponse } from 'next/server';

interface EncodeRequest {
  spliceInfo: SpliceInfoSection;
  command: SpliceCommand;
  commandType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: EncodeRequest = await request.json();
    
    // Validate input
    if (!body.spliceInfo || !body.command) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Process request
    const result = await encodeSCTE35(body);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error("Encoding error:", error);
    return NextResponse.json(
      { error: "Failed to encode SCTE-35" },
      { status: 500 }
    );
  }
}
```

### File Organization

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── encoder/           # Encoder page
│   ├── stream-injection/  # Stream injection page
│   └── monitor/           # Monitor page
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── stream-injection.tsx # Custom components
├── lib/                  # Utility functions
│   ├── scte35.ts         # SCTE-35 encoding logic
│   └── utils.ts          # General utilities
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
└── tests/                # Test files
```

### Naming Conventions

- **Files**: Use kebab-case for files (`stream-injection.tsx`)
- **Components**: Use PascalCase for components (`StreamInjection`)
- **Variables**: Use camelCase for variables (`streamConfig`)
- **Constants**: Use UPPER_SNAKE_CASE for constants (`MAX_BITRATE`)
- **Interfaces**: Use PascalCase for interfaces (`StreamConfig`)
- **Types**: Use PascalCase for types (`SCTE35Command`)

## 🧪 Testing Guidelines

### Unit Tests

- Test individual functions and components
- Mock external dependencies
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern

```typescript
// Good
describe('SCTE35Encoder', () => {
  it('should encode splice insert command correctly', () => {
    // Arrange
    const encoder = new SCTE35Encoder();
    const config = createTestConfig();
    
    // Act
    const result = encoder.encode(config);
    
    // Assert
    expect(result.base64).toBeDefined();
    expect(result.hex).toBeDefined();
    expect(result.base64.length).toBeGreaterThan(0);
  });
});
```

### Integration Tests

- Test API endpoints
- Test component interactions
- Use real dependencies when possible
- Test error scenarios

```typescript
// Good
describe('SCTE-35 API', () => {
  it('should return 400 for invalid input', async () => {
    const response = await fetch('/api/scte35/encode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invalid: 'data' })
    });
    
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body.error).toBeDefined();
  });
});
```

### E2E Tests

- Test user workflows
- Use Playwright or Cypress
- Test critical user journeys
- Mock external services

```typescript
// Good
test('user can encode SCTE-35 and copy to clipboard', async ({ page }) => {
  await page.goto('/encoder');
  
  // Fill in encoder form
  await page.fill('#spliceEventId', '1');
  await page.fill('#uniqueProgramId', '1');
  
  // Click encode button
  await page.click('button:has-text("Encode SCTE-35")');
  
  // Wait for result
  await page.waitForSelector('textarea[readonly]');
  
  // Copy to clipboard
  await page.click('button:has-text("Copy")');
  
  // Verify clipboard content
  const clipboardContent = await page.evaluate(() => 
    navigator.clipboard.readText()
  );
  expect(clipboardContent.length).toBeGreaterThan(0);
});
```

## 📚 Documentation Guidelines

### Code Comments

- Add JSDoc comments for public APIs
- Comment complex logic
- Explain "why" not "what"
- Keep comments up to date

```typescript
// Good
/**
 * Encodes SCTE-35 splice insert command into Base64 and Hex formats
 * @param config - SCTE-35 encoding configuration
 * @returns Object containing Base64 and Hex encoded data
 * @throws Error if encoding fails
 */
export function encodeSpliceInsert(config: SpliceInsertConfig): EncodeResult {
  // Implementation
}
```

### README Updates

- Update README for new features
- Include usage examples
- Document breaking changes
- Keep installation instructions current

### API Documentation

- Document all API endpoints
- Include request/response examples
- Document error responses
- Provide cURL examples

```markdown
## Encode SCTE-35

Encodes SCTE-35 data into Base64 and Hex formats.

### Request

```http
POST /api/scte35/encode
Content-Type: application/json

{
  "spliceInfo": {...},
  "command": {...},
  "commandType": "splice-insert"
}
```

### Response

```json
{
  "base64": "/DAvAAAAAAAAAP/wFAUAAAAB...",
  "hex": "FC302A0000002673C0FFFFF00F..."
}
```

### Errors

- `400 Bad Request` - Invalid input data
- `500 Internal Server Error` - Encoding failed
```

## 🔄 Pull Request Process

### PR Checklist

Before submitting a pull request, ensure:

- [ ] Code follows the [Coding Standards](#coding-standards)
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Documentation is updated
- [ ] Changes are tested manually
- [ ] PR description is clear and comprehensive
- [ ] Related issues are linked

### PR Template

```markdown
## Changes
- Description of changes made
- List of files modified
- Screenshots if applicable (for UI changes)

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- How were these changes tested?
- What test scenarios were covered?
- Any manual testing performed?

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes
- [ ] Any dependent changes have been merged and published in downstream modules

## Related Issues
Closes #123
Related to #456
```

### Review Process

1. **Automated Checks**
   - All CI checks must pass
   - Code must be properly formatted
   - Tests must pass

2. **Code Review**
   - At least one maintainer must approve
   - Address all review comments
   - Update code as requested

3. **Final Approval**
   - Ensure all requirements are met
   - Merge the PR
   - Delete the feature branch (optional)

## 🐛 Issue Reporting

### Bug Reports

When reporting bugs, please include:

1. **Environment Information**
   - Node.js version
   - Operating system
   - Browser version (if applicable)

2. **Steps to Reproduce**
   - Clear, reproducible steps
   - Expected behavior
   - Actual behavior

3. **Error Messages**
   - Full error stack traces
   - Console output
   - Network request details

4. **Additional Context**
   - Screenshots
   - Configuration files
   - Sample data

### Feature Requests

When requesting features, please include:

1. **Problem Statement**
   - What problem are you trying to solve?
   - What use case does this address?

2. **Proposed Solution**
   - Detailed description of the feature
   - How it should work
   - User interface considerations

3. **Alternatives**
   - Any alternative solutions considered
   - Why the proposed solution is preferred

4. **Additional Context**
   - Mockups or screenshots
   - Examples from other tools
   - Relevant standards or specifications

### Issue Template

```markdown
## Type
- [ ] Bug Report
- [ ] Feature Request
- [ ] Documentation
- [ ] Question

## Environment
- Node.js version: [e.g. 18.0.0]
- OS: [e.g. Ubuntu 20.04]
- Browser: [e.g. Chrome 120.0.0]

## Description
[Clear description of the issue or request]

## Steps to Reproduce (for bugs)
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
[What you expected to happen]

## Actual Behavior
[What actually happened]

## Screenshots (if applicable)
[Attach screenshots]

## Additional Context
[Any other context about the problem]
```

## 🤝 Getting Help

- **Documentation**: Check the [README](README.md) and [Wiki](https://github.com/your-username/scte35-encoder/wiki)
- **Issues**: Search existing [GitHub Issues](https://github.com/your-username/scte35-encoder/issues)
- **Discussions**: Join [GitHub Discussions](https://github.com/your-username/scte35-encoder/discussions)
- **Discord**: Join our community server (if available)

Thank you for contributing to the SCTE-35 Encoder & Stream Injector project! 🎉