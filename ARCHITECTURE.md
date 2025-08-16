# Video Subtitle Burner - Architecture Documentation

## Overview

This project has been refactored from a monolithic single-component application to a well-structured, maintainable, and extensible Next.js application following enterprise-level best practices.

## Architecture Principles

### 1. Feature-Based Organization
The application is organized by features rather than file types, promoting:
- **Colocation**: Related code is kept together
- **Scalability**: Easy to add new features without affecting existing ones
- **Maintainability**: Clear boundaries between different parts of the application

### 2. Separation of Concerns
- **Components**: Pure UI components with minimal business logic
- **Hooks**: Reusable logic and state management
- **Services**: Business logic and external API interactions
- **Stores**: Global state management with Zustand
- **Types**: Comprehensive TypeScript definitions

### 3. Composition over Inheritance
- Small, focused components that can be composed together
- Reusable hooks and utilities
- Provider pattern for context sharing

## Project Structure

```
src/
├── app/                           # Next.js app directory
│   ├── VideoSubtitleBurner.tsx   # Original component (legacy)
│   ├── VideoSubtitleBurner_Refactored.tsx # New refactored version
│   └── ...
├── components/                    # Shared UI components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   └── ...
├── features/                     # Feature-based modules
│   ├── video-processing/         # Video processing feature
│   │   ├── components/          # Feature-specific components
│   │   ├── hooks/               # Feature-specific hooks
│   │   ├── providers/           # Context providers
│   │   ├── types/               # TypeScript types
│   │   └── index.ts             # Feature exports
│   └── ui/                      # UI utilities and components
├── hooks/                       # Shared hooks
├── lib/                         # Utilities and configurations
├── services/                    # Business logic and API services
├── stores/                      # Global state management
│   ├── enhanced/               # Enhanced stores with advanced features
│   └── ...
└── types/                      # Shared TypeScript types
```

## Key Components

### 1. VideoProcessingService
**Location**: `src/services/VideoProcessingService.ts`

A service class that encapsulates all video processing business logic:
- FFmpeg initialization and management
- Video file analysis
- Subtitle parsing and filtering
- Memory monitoring
- Error handling

**Benefits**:
- Clean separation of business logic from UI
- Testable in isolation
- Reusable across different components

### 2. VideoProcessingProvider
**Location**: `src/features/video-processing/providers/VideoProcessingProvider.tsx`

A React Context provider that:
- Manages all video processing state
- Provides actions for state updates
- Handles side effects and async operations
- Integrates with the VideoProcessingService

**Benefits**:
- Centralized state management for the feature
- Type-safe context API
- Automatic error handling and logging

### 3. Enhanced Stores
**Location**: `src/stores/enhanced/`

Advanced Zustand stores with:
- **ErrorStore**: Comprehensive error tracking and handling
- **LogStore**: Structured logging with levels and persistence
- **PerformanceStore**: System metrics and processing efficiency tracking

**Benefits**:
- Persistent state across sessions
- Advanced debugging capabilities
- Performance monitoring and optimization

### 4. Reusable Components
**Location**: `src/features/video-processing/components/`

Modular, composable components:
- **FileUploadCard**: Reusable file upload interface
- **ProcessingProgress**: Progress tracking with cancellation
- **VideoResult**: Video display and download
- **ProcessingButton**: Smart processing trigger

**Benefits**:
- Consistent UI patterns
- Easy to test and maintain
- Reusable across different layouts

## State Management Strategy

### Global State (Zustand)
- **Video Store**: File management and processing state
- **Progress Store**: Progress tracking and logging
- **Error Store**: Error handling and tracking
- **Performance Store**: System metrics

### Local State (React)
- UI-specific state (modals, tabs, etc.)
- Component-specific temporary state

### Context API
- Feature-specific state sharing
- Type-safe provider pattern

## Error Handling Strategy

### 1. Layered Error Handling
- **Service Level**: Catches and wraps service errors
- **Hook Level**: Provides error boundaries for async operations
- **Component Level**: Displays user-friendly error messages
- **Global Level**: Error store for tracking and debugging

### 2. Error Types
- **Validation Errors**: Input validation and file format issues
- **Processing Errors**: FFmpeg and video processing failures
- **System Errors**: Memory, performance, and resource issues
- **Network Errors**: External API and resource loading failures

### 3. Error Recovery
- Automatic retry mechanisms
- Graceful degradation
- User-guided recovery flows

## Performance Optimizations

### 1. Code Splitting
- Feature-based module splitting
- Lazy loading of heavy components
- Dynamic imports for optional features

### 2. Memory Management
- Automatic cleanup of video URLs
- Memory usage monitoring
- Progress-based resource management

### 3. React Optimizations
- Memoized components with React.memo
- Optimized re-renders with proper dependency arrays
- Debounced file operations

### 4. State Optimizations
- Zustand for minimal re-renders
- Selective subscriptions
- Computed values and selectors

## Testing Strategy

### 1. Unit Tests
- Component testing with React Testing Library
- Service testing with Jest
- Hook testing with custom utilities

### 2. Integration Tests
- Feature workflow testing
- Provider integration testing
- Error handling scenarios

### 3. Test Structure
```
__tests__/
├── components/     # Component tests
├── hooks/         # Hook tests
├── services/      # Service tests
└── utils/         # Utility tests
```

## Development Workflow

### 1. Feature Development
1. Define types in `types/index.ts`
2. Create service if needed
3. Build reusable components
4. Create feature provider
5. Export through feature index
6. Add tests

### 2. Code Quality
- TypeScript for type safety
- ESLint for code quality
- Jest for testing
- Comprehensive error handling

### 3. Performance Monitoring
- Built-in performance store
- Memory usage tracking
- Processing efficiency metrics

## Migration Strategy

### Phase 1: ✅ Completed
- Created new architecture
- Built service layer
- Developed reusable components
- Set up enhanced stores

### Phase 2: In Progress
- Comprehensive testing
- Performance optimizations
- Documentation

### Phase 3: Future
- Replace legacy component
- Add advanced features
- Performance monitoring dashboard

## Benefits of This Architecture

### 1. Maintainability
- Clear separation of concerns
- Feature-based organization
- Comprehensive error handling
- Extensive testing coverage

### 2. Scalability
- Modular architecture
- Reusable components and hooks
- Service-oriented design
- Performance monitoring

### 3. Developer Experience
- Type safety throughout
- Clear patterns and conventions
- Comprehensive documentation
- Debugging utilities

### 4. User Experience
- Better error handling
- Performance monitoring
- Consistent UI patterns
- Reliable processing

## Next Steps

1. **Complete Testing**: Add more comprehensive test coverage
2. **Performance Dashboard**: Build monitoring UI
3. **Advanced Features**: Add batch processing, presets, etc.
4. **Documentation**: API documentation and user guides
5. **Migration**: Gradually replace legacy components

This architecture provides a solid foundation for building a maintainable, scalable, and performant video processing application.