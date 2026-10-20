import { ExamplePrompt } from '../types';

export const EXAMPLE_PROMPTS: ExamplePrompt[] = [
  {
    id: 'prime-check',
    title: 'Prime Number Checker',
    language: 'Python',
    prompt: 'Write a Python function to check whether a number is prime, including edge cases and optimal O(sqrt(n)) time complexity.',
    description: 'Number theory algorithm with corner case handling.',
    previewCode: `def is_prime(n: int) -> bool:
    """Return True if n is a prime number, else False."""
    if n <= 1:
        return False
    if n <= 3:
        return True
    if n % 2 == 0 or n % 3 == 0:
        return False
    i = 5
    while i * i <= n:
        if n % i == 0 or n % (i + 2) == 0:
            return False
        i += 6
    return True

# Example test calls
if __name__ == "__main__":
    test_cases = [1, 2, 17, 25, 97, 100]
    for num in test_cases:
        print(f"{num}: {is_prime(num)}")`,
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache Implementation',
    language: 'Python',
    prompt: 'Implement a Least Recently Used (LRU) Cache in Python using an OrderedDict with get(key) and put(key, value) in O(1) time.',
    description: 'Classic data structure with fixed capacity and eviction.',
    previewCode: `from collections import OrderedDict
from typing import Any, Optional

class LRUCache:
    """Least Recently Used (LRU) cache with O(1) lookup and insert."""
    def __init__(self, capacity: int):
        self.capacity = capacity
        self.cache: OrderedDict[str, Any] = OrderedDict()

    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        self.cache.move_to_end(key)
        return self.cache[key]

    def put(self, key: str, value: Any) -> None:
        if key in self.cache:
            self.cache.move_to_end(key)
        self.cache[key] = value
        if len(self.cache) > self.capacity:
            self.cache.popitem(last=False)
`,
  },
  {
    id: 'debounce-js',
    title: 'Debounce Function',
    language: 'JavaScript',
    prompt: 'Write a reusable JavaScript debounce utility with immediate execution flag and cancel method for input event optimization.',
    description: 'Frontend event rate-limiter commonly used in search inputs.',
    previewCode: `/**
 * Creates a debounced function that delays invoking func until after wait ms.
 */
function debounce(func, wait, immediate = false) {
  let timeoutId = null;

  function debounced(...args) {
    const callNow = immediate && !timeoutId;
    
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    timeoutId = setTimeout(() => {
      timeoutId = null;
      if (!immediate) {
        func.apply(this, args);
      }
    }, wait);

    if (callNow) {
      func.apply(this, args);
    }
  }

  debounced.cancel = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounced;
}`,
  },
  {
    id: 'binary-search-tree',
    title: 'Binary Search Tree',
    language: 'Java',
    prompt: 'Write a Java class for a Binary Search Tree with insert, search, and in-order traversal methods.',
    description: 'Core recursive hierarchical data structure.',
    previewCode: `public class BinarySearchTree {
    static class Node {
        int key;
        Node left, right;
        public Node(int item) {
            key = item;
            left = right = null;
        }
    }

    Node root;

    public void insert(int key) {
        root = insertRec(root, key);
    }

    private Node insertRec(Node root, int key) {
        if (root == null) {
            return new Node(key);
        }
        if (key < root.key) {
            root.left = insertRec(root.left, key);
        } else if (key > root.key) {
            root.right = insertRec(root.right, key);
        }
        return root;
    }

    public boolean search(int key) {
        return searchRec(root, key);
    }

    private boolean searchRec(Node root, int key) {
        if (root == null) return false;
        if (root.key == key) return true;
        return key < root.key ? searchRec(root.left, key) : searchRec(root.right, key);
    }
}`,
  },
  {
    id: 'quicksort-cpp',
    title: 'Generic QuickSort',
    language: 'C++',
    prompt: 'Write a template-based QuickSort function in C++ using median-of-three pivot selection and std::vector.',
    description: 'Efficient divide-and-conquer sorting in modern C++.',
    previewCode: `#include <iostream>
#include <vector>
#include <algorithm>

template <typename T>
int partition(std::vector<T>& arr, int low, int high) {
    T pivot = arr[high];
    int i = low - 1;
    for (int j = low; j < high; ++j) {
        if (arr[j] <= pivot) {
            ++i;
            std::swap(arr[i], arr[j]);
        }
    }
    std::swap(arr[i + 1], arr[high]);
    return i + 1;
}

template <typename T>
void quickSort(std::vector<T>& arr, int low, int high) {
    if (low < high) {
        int pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
}`,
  },
  {
    id: 'circular-buffer-c',
    title: 'Ring Buffer (Circular Queue)',
    language: 'C',
    prompt: 'Implement a thread-safe ring buffer in C with fixed capacity, enqueue, and dequeue operations checking for overflow and underflow.',
    description: 'Low-level systems buffer for streaming I/O.',
    previewCode: `#include <stdio.h>
#include <stdbool.h>

#define BUFFER_CAPACITY 8

typedef struct {
    int data[BUFFER_CAPACITY];
    int head;
    int tail;
    int count;
} RingBuffer;

void rb_init(RingBuffer *rb) {
    rb->head = 0;
    rb->tail = 0;
    rb->count = 0;
}

bool rb_push(RingBuffer *rb, int value) {
    if (rb->count >= BUFFER_CAPACITY) return false;
    rb->data[rb->tail] = value;
    rb->tail = (rb->tail + 1) % BUFFER_CAPACITY;
    rb->count++;
    return true;
}

bool rb_pop(RingBuffer *rb, int *out_value) {
    if (rb->count == 0) return false;
    *out_value = rb->data[rb->head];
    rb->head = (rb->head + 1) % BUFFER_CAPACITY;
    rb->count--;
    return true;
}`,
  }
];
