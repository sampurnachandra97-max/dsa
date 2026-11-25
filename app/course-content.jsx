import { problems } from './problems';

const units = [
  [1, 5, [
    ["Introduction", [13], [
      "Data and information",
      "Representation of data",
      "Data types",
      "Data structures",
      "Classification of data structures",
      "Applications of data structures",
      "Abstract data types",
      "Operations on data structures",
      "Overview of data structures",
      "Algorithms",
      "Types of algorithms",
      "Algorithm development life cycle",
    ]],
    ["Arrays and strings", [1,10,14,15,16], [
      "Arrays",
      "One-dimensional arrays",
      "Address calculation in one-dimensional arrays",
      "Multidimensional arrays",
      "Address calculation in two-dimensional arrays",
      "Array operations",
      "Applications of arrays",
      "Polynomial representation",
      "Sparse matrices",
      "Strings",
      "Arrays of strings",
      "String operations",
    ]],
    ["Pointers and dynamic memory", [14], [
      "Pointer declaration",
      "Address-of operator",
      "Indirection operator",
      "Null pointers",
      "Void pointers",
      "Generic functions",
      "Dangling pointers",
      "Pointer arithmetic",
      "Pointers to pointers",
      "Pointers and arrays",
      "Arrays of pointers",
      "Pointers to arrays",
      "Function pointers",
      "Passing addresses to functions",
      "Functions returning pointers",
      "Dynamic memory allocation",
      "Creating one-dimensional arrays",
      "Creating two-dimensional arrays",
      "Pointers, arrays, and strings",
    ]],
  ]],
  [2, 10, [
    ["Searching and sorting", [5,17,18], [
      "Linear search",
      "Binary search",
      "Interpolation search",
      "Bubble sort",
      "Insertion sort",
      "Selection sort",
      "Quicksort",
      "Merge sort",
      "Heapsort",
      "Radix sort",
      "Shell sort",
      "Time complexity of sorting algorithms",
    ]],
    ["Recursion", [7,19,20,21], [
      "Recursion essentials",
      "Infinite recursion and stack overflow",
      "Recursion depth",
      "Recursion trees",
      "Types of recursion",
      "Factorial",
      "Fibonacci sequence",
      "Greatest common divisor (GCD)",
      "Integer powers",
      "Tower of Hanoi",
      "Non-attacking eight queens",
      "Converting recursive functions to iterative functions",
      "Multipath recursion in sequences",
    ]],
  ]],
  [3, 15, [
    ["Stacks and queues", [2,11,22,23,24], [
      "Stacks",
      "Stack operations",
      "Array-based stacks",
      "Linked-list-based stacks",
      "Processing function calls",
      "Evaluating arithmetic expressions",
      "Queues",
      "Queue operations",
      "Array-based queues",
      "Linked-list-based queues",
      "Applications of queues",
      "Drawbacks of linear queues",
      "Circular queues",
      "Array-based circular queues",
      "Deques",
      "Deque operations",
      "Priority queues",
      "Representing priority queues",
    ]],
    ["Linked lists", [25,26], [
      "Limitations of arrays",
      "Linked lists",
      "Singly linked lists",
      "Singly linked list operations",
      "Representing polynomials with linked lists",
      "Circular linked lists",
      "Circular linked list operations",
      "Josephus problem",
      "Doubly linked lists",
      "Doubly linked list operations",
      "Circular doubly linked lists",
      "Disadvantages of linked lists",
    ]],
  ]],
  [4, 10, [
    ["Trees", [27,28,29,30,31], [
      "Tree terminology",
      "Binary trees",
      "Strictly binary trees",
      "Extended binary trees",
      "Complete binary trees",
      "Full binary trees",
      "Skewed binary trees",
      "Binary expression trees",
      "Balanced binary trees",
      "Threaded binary trees",
      "Properties of binary trees",
      "Binary tree representations",
      "Binary tree traversal",
      "Binary search trees",
      "Binary search tree operations",
      "Heaps",
      "Heap operations",
      "AVL trees",
      "AVL tree operations",
      "Red-black trees",
    ]],
    ["Graphs", [32,33], [
      "Graph terminology",
      "Directed graph terminology",
      "Graph operations",
      "Graph representations",
      "Graph traversal",
      "Spanning trees",
      "Minimum spanning trees",
      "Kruskal’s algorithm",
      "Prim’s algorithm",
    ]],
  ]],
  [5, 5, [
    ["Hashing", [34,35], [
      "Hash tables",
      "Hash functions",
      "Division method",
      "Mid-square method",
      "Folding method",
      "Collision resolution",
      "Linear probing",
      "Quadratic probing",
      "Double hashing",
      "Separate chaining",
      "Load factor",
    ]],
    ["File structures", [36,37], [
      "Elements of a file system",
      "Categories of file organization",
      "Sequential file organization",
      "Heap file organization",
      "Hash file organization",
      "Index-sequential file organization",
      "Primary indexes",
      "Secondary indexes",
    ]],
  ]],
];

export default function CourseContent() {
  return <section className="course-content">
    <header className="course-header">
      <h1>Course content</h1>
      <p>Explore the five DSA units and open a practice problem for each area.</p>
    </header>
    <div className="course-units">
      {units.map(([unit, hours, sections]) => <details className="course-unit" key={unit} open={unit === 1}>
        <summary><div><strong>Unit {unit}</strong><span>{sections.map(([title]) => title).join(' · ')}</span></div><span className="course-hours">{hours} lecture hours</span></summary>
        <div className="course-sections">
          {sections.map(([title, ids, topics]) => <section className="course-module" key={title}>
            <h2>{title}</h2>
            <ul className="course-topics">{topics.map(topic => <li key={topic}>{topic}</li>)}</ul>
            <div className="course-practice"><h3>Practice problems</h3>
              <ul>{ids.map(id => {
                const problem = problems.find(item => item.id === id);
                return <li key={id}><a href={'/problems/' + id + '/'}>{problem.title}</a></li>;
              })}</ul>
            </div>
          </section>)}
        </div>
      </details>)}
    </div>
  </section>;
}
