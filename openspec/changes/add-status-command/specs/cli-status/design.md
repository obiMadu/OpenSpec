# CLI Status Command Design

## Implementation Architecture

### Module Structure

```typescript
src/
├── cli/
│   └── commands/
│       └── status.ts         # Command definition and CLI interface
├── core/
│   ├── status/
│   │   ├── index.ts         # Main status orchestration
│   │   ├── scanner.ts       # Change directory discovery
│   │   ├── categorizer.ts   # Change categorization logic
│   │   └── formatter.ts     # Output formatting
│   └── index.ts
└── utils/
    ├── task-parser.ts       # Robust task parsing utilities
    └── file-system.ts       # Shared file operations
```

### Core Components

#### Task Parser
Handles robust parsing of task files with format tolerance:

```typescript
interface TaskParser {
  parseFile(content: string): TaskParseResult;
  isComplete(line: string): boolean;
  isIncomplete(line: string): boolean;
  normalizeFormat(content: string): string;
}

interface TaskParseResult {
  total: number;
  completed: number;
  incomplete: number;
  incompleteTasks: TaskItem[];
  hasErrors: boolean;
  warnings: string[];
}

interface TaskItem {
  line: number;
  text: string;
  indentLevel: number;
  isSubtask: boolean;
}
```

#### Status Scanner
Discovers and analyzes changes:

```typescript
class StatusScanner {
  async scanChanges(rootPath: string): Promise<Change[]>;
  async getChangeMetadata(changePath: string): Promise<ChangeMetadata>;
  private isArchived(changePath: string): boolean;
  private async getFileStats(path: string): Promise<FileStats>;
}

interface Change {
  name: string;
  path: string;
  category: 'ready' | 'in-progress' | 'archived';
  tasks: TaskStatus;
  metadata: ChangeMetadata;
}

interface ChangeMetadata {
  lastModified: Date;
  ageInDays: number;
  fileCount: number;
  hasSpecs: boolean;
  sizeInBytes: number;
}
```

#### Categorizer
Determines change status based on rules:

```typescript
class Categorizer {
  categorize(change: RawChange): Category;
  isReady(tasks: TaskStatus): boolean;
  isInProgress(tasks: TaskStatus): boolean;
  getRecommendedAction(category: Category): string;
}

enum Category {
  READY_TO_ARCHIVE = 'ready',
  IN_PROGRESS = 'in-progress',
  RECENTLY_ARCHIVED = 'archived',
  ERROR = 'error'
}
```

#### Output Formatter
Handles display formatting for different output modes:

```typescript
class OutputFormatter {
  formatSummary(data: StatusData): string;
  formatDetailed(data: StatusData): string;
  formatJson(data: StatusData): string;
  private colorize(text: string, color: Color): string;
  private generateProgressBar(completed: number, total: number): string;
}
```

### Data Models

```typescript
interface StatusData {
  summary: {
    readyCount: number;
    inProgressCount: number;
    archivedCount: number;
    totalChanges: number;
  };
  ready: Change[];
  inProgress: Change[];
  archived: Change[];
  errors: ErrorInfo[];
  generatedAt: Date;
}

interface TaskStatus {
  total: number;
  completed: number;
  incomplete: number;
  percentage: number;
  incompleteTasks: string[];
}

interface ErrorInfo {
  changeName: string;
  error: string;
  recoverable: boolean;
}
```

## Task Parsing Strategy

### Regex Patterns

```typescript
const TASK_PATTERNS = {
  // Primary patterns (high confidence)
  complete: /^\s*[-*+]\s*\[[xX✓✗*]\s*\]/,
  incomplete: /^\s*[-*+]\s*\[\s*\]/,
  
  // Extended patterns (medium confidence)
  numberedComplete: /^\s*\d+\.\s*\[[xX✓]\s*\]/,
  numberedIncomplete: /^\s*\d+\.\s*\[\s*\]/,
  
  // Context detection
  codeBlockStart: /^```/,
  codeBlockEnd: /^```/,
  exampleSection: /^#{1,6}.*\b(example|sample|demo)\b/i,
  taskSection: /^#{1,6}.*\b(task|todo|checklist)\b/i,
};
```

### Context-Aware Parsing

```typescript
class ContextAwareParser {
  private inCodeBlock = false;
  private inExampleSection = false;
  private currentSection = '';
  
  parseLine(line: string, lineNumber: number): TaskLineResult {
    // Skip if in code block
    if (line.match(TASK_PATTERNS.codeBlockStart)) {
      this.inCodeBlock = !this.inCodeBlock;
      return { skip: true };
    }
    
    if (this.inCodeBlock) {
      return { skip: true };
    }
    
    // Track section context
    if (line.match(/^#{1,6}/)) {
      this.currentSection = line;
      this.inExampleSection = !!line.match(TASK_PATTERNS.exampleSection);
    }
    
    // Skip example sections
    if (this.inExampleSection) {
      return { skip: true };
    }
    
    // Parse task
    if (TASK_PATTERNS.complete.test(line)) {
      return { type: 'complete', text: this.extractTaskText(line) };
    }
    
    if (TASK_PATTERNS.incomplete.test(line)) {
      return { type: 'incomplete', text: this.extractTaskText(line) };
    }
    
    return { skip: false };
  }
}
```

## Performance Optimizations

### Parallel Scanning
```typescript
async function scanChangesParallel(changesDirs: string[]): Promise<Change[]> {
  const BATCH_SIZE = 10;
  const results: Change[] = [];
  
  for (let i = 0; i < changesDirs.length; i += BATCH_SIZE) {
    const batch = changesDirs.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map(dir => scanSingleChange(dir))
    );
    results.push(...batchResults);
  }
  
  return results;
}
```

### Caching Strategy
```typescript
class StatusCache {
  private cache = new Map<string, CachedResult>();
  private readonly TTL = 5000; // 5 seconds
  
  get(key: string): StatusData | null {
    const cached = this.cache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return cached.data;
  }
  
  set(key: string, data: StatusData): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
}
```

### Streaming File Reading
```typescript
async function streamTaskFile(filepath: string): Promise<TaskStatus> {
  const stream = fs.createReadStream(filepath, { encoding: 'utf8' });
  const parser = new ContextAwareParser();
  let completed = 0, incomplete = 0;
  
  for await (const chunk of stream) {
    const lines = chunk.split('\n');
    for (const line of lines) {
      const result = parser.parseLine(line);
      if (result.type === 'complete') completed++;
      if (result.type === 'incomplete') incomplete++;
    }
  }
  
  return { completed, incomplete, total: completed + incomplete };
}
```

## Error Handling Strategy

### Graceful Degradation
```typescript
async function scanWithFallback(changePath: string): Promise<Change> {
  try {
    // Primary scanning logic
    return await scanChange(changePath);
  } catch (error) {
    // Fallback to basic info
    return {
      name: path.basename(changePath),
      category: 'error',
      tasks: { total: 0, completed: 0, incomplete: 0 },
      metadata: { error: error.message }
    };
  }
}
```

### Error Collection
```typescript
class ErrorCollector {
  private errors: ErrorInfo[] = [];
  
  add(changeName: string, error: Error, recoverable = true): void {
    this.errors.push({
      changeName,
      error: error.message,
      recoverable,
      timestamp: new Date()
    });
  }
  
  getErrors(): ErrorInfo[] {
    return this.errors;
  }
  
  hasErrors(): boolean {
    return this.errors.length > 0;
  }
  
  hasCriticalErrors(): boolean {
    return this.errors.some(e => !e.recoverable);
  }
}
```

## Testing Approach

### Test Fixtures
```typescript
// test/fixtures/tasks/
const TEST_CASES = {
  standard: `
    - [x] Completed task
    - [ ] Incomplete task
  `,
  
  mixed_formats: `
    - [X] Uppercase complete
    - [✓] Checkmark complete
    * [ ] Asterisk bullet
    + [x] Plus bullet
  `,
  
  with_code_blocks: `
    ## Tasks
    - [x] Real task
    
    \`\`\`markdown
    - [ ] This is in a code block, not a real task
    \`\`\`
    
    - [ ] Another real task
  `,
  
  nested_tasks: `
    - [x] Main task
      - [x] Subtask 1
      - [ ] Subtask 2
        - [x] Sub-subtask
  `
};
```

### Unit Test Structure
```typescript
describe('TaskParser', () => {
  describe('parseFile', () => {
    it('should parse standard format tasks', () => {
      const result = parser.parseFile(TEST_CASES.standard);
      expect(result.completed).toBe(1);
      expect(result.incomplete).toBe(1);
    });
    
    it('should handle mixed formats', () => {
      const result = parser.parseFile(TEST_CASES.mixed_formats);
      expect(result.completed).toBe(3);
      expect(result.incomplete).toBe(1);
    });
    
    it('should skip code blocks', () => {
      const result = parser.parseFile(TEST_CASES.with_code_blocks);
      expect(result.total).toBe(2); // Not 3
    });
  });
});
```

## Security Considerations

### Path Traversal Prevention
```typescript
function validateChangePath(changePath: string): boolean {
  const normalized = path.normalize(changePath);
  const resolved = path.resolve(changePath);
  
  // Ensure path stays within project
  if (!resolved.startsWith(process.cwd())) {
    throw new Error('Invalid change path: outside project directory');
  }
  
  // Prevent hidden directories
  if (normalized.includes('/.')) {
    throw new Error('Invalid change path: hidden directories not allowed');
  }
  
  return true;
}
```

### Resource Limits
```typescript
const LIMITS = {
  MAX_FILE_SIZE: 1024 * 1024,      // 1MB
  MAX_CHANGES: 1000,                // Maximum changes to scan
  MAX_TASKS_PER_FILE: 10000,        // Prevent DoS
  SCAN_TIMEOUT: 30000,              // 30 seconds
};
```