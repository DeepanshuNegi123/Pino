// IndiaBIX-style hierarchical topic & question dataset for Pioneer
export const defaultTopics = [
  {
    category: "Quantitative Aptitude",
    icon: "",
    topics: [
      {
        id: "time-and-work",
        title: "Time and Work",
        summary: "Concepts of work-rate, inverse proportion, and combined work problems.",
        materials: [], // real PDFs uploaded by the user will be attached here
        questions: [
          {
            id: "tw-q1",
            qNumber: 1,
            questionText: "A can do a piece of work in 10 days, and B can do the same work in 15 days. How many days will they take to finish the work together?",
            options: [
              "5 days",
              "6 days",
              "8 days",
              "9 days"
            ],
            correctOption: 1,
            explanation: `Step 1: Calculate 1 day work for each.
• A's 1-day work = 1 / 10
• B's 1-day work = 1 / 15

Step 2: Combined 1-day work of (A + B):
= (1 / 10) + (1 / 15)
= (3 + 2) / 30 = 5 / 30 = 1 / 6

Step 3: Total days required = 1 / (1/6) = 6 days.
Hence, Option B is correct.`,
            difficulty: "Easy"
          },
          {
            id: "tw-q2",
            qNumber: 2,
            questionText: "A and B can together finish a work in 30 days. They worked together for 20 days and then B left. After another 20 days, A finished the remaining work. In how many days can A alone finish the work?",
            options: [
              "40 days",
              "50 days",
              "54 days",
              "60 days"
            ],
            correctOption: 3,
            explanation: `Step 1: Work done by (A + B) in 20 days:
= 20 * (1 / 30) = 2 / 3 of the total work.

Step 2: Remaining work:
= 1 - (2 / 3) = 1 / 3.

Step 3: A finishes 1/3 of the work in 20 days.
Therefore, whole work done by A alone = 20 * 3 = 60 days.
Option D is correct.`,
            difficulty: "Medium"
          },
          {
            id: "tw-q3",
            qNumber: 3,
            questionText: "A is twice as good a workman as B and together they finish a piece of work in 18 days. In how many days will A alone finish the work?",
            options: [
              "27 days",
              "24 days",
              "36 days",
              "30 days"
            ],
            correctOption: 0,
            explanation: `Step 1: Ratio of times taken by A and B = 1 : 2.
Let time taken by A = x days, and B = 2x days.

Step 2: 1-day work equation:
(1 / x) + (1 / 2x) = 1 / 18
3 / (2x) = 1 / 18
2x = 54  ==>  x = 27 days.

Thus, A alone can finish in 27 days.
Option A is correct.`,
            difficulty: "Medium"
          }
        ]
      },
      {
        id: "problems-on-trains",
        title: "Problems on Trains",
        summary: "Speed, relative speed, distance, conversion between km/hr and m/sec.",
        materials: [],
        questions: [
          {
            id: "pot-q1",
            qNumber: 1,
            questionText: "A train running at the speed of 60 km/hr crosses a pole in 9 seconds. What is the length of the train?",
            options: [
              "120 metres",
              "180 metres",
              "324 metres",
              "150 metres"
            ],
            correctOption: 3,
            explanation: `Step 1: Convert speed from km/hr to m/s:
Speed = 60 * (5 / 18) = 50 / 3 m/sec.

Step 2: Distance = Speed * Time
Length of train = (50 / 3) * 9 = 150 metres.

Correct Answer: Option D.`,
            difficulty: "Easy"
          },
          {
            id: "pot-q2",
            qNumber: 2,
            questionText: "A train 125 m long passes a man, running at 5 km/hr in the same direction in which the train is going, in 10 seconds. The speed of the train is:",
            options: [
              "45 km/hr",
              "50 km/hr",
              "54 km/hr",
              "55 km/hr"
            ],
            correctOption: 1,
            explanation: `Step 1: Speed of train relative to man:
Relative speed = 125 / 10 = 12.5 m/sec.

Step 2: Convert relative speed to km/hr:
= 12.5 * (18 / 5) = 45 km/hr.

Step 3: Since both are moving in same direction:
Relative speed = Speed of train - Speed of man
45 = Speed of train - 5
Speed of train = 50 km/hr.
Option B is correct.`,
            difficulty: "Medium"
          }
        ]
      },
      {
        id: "profit-and-loss",
        title: "Profit and Loss",
        summary: "Cost Price (CP), Selling Price (SP), Markup, Discount, and Percentage gains/losses.",
        materials: [],
        questions: [
          {
            id: "pnl-q1",
            qNumber: 1,
            questionText: "If cost price of 15 articles is equal to the selling price of 12 articles, what is the gain percent?",
            options: [
              "20%",
              "25%",
              "30%",
              "33.33%"
            ],
            correctOption: 1,
            explanation: `Let CP of each article = Rs. 1.
CP of 12 articles = Rs. 12.
SP of 12 articles = CP of 15 articles = Rs. 15.

Profit on 12 articles = 15 - 12 = Rs. 3.
Gain % = (3 / 12) * 100 = 25%.
Option B is correct.`,
            difficulty: "Easy"
          }
        ]
      }
    ]
  },
  {
    category: "Logical & Verbal Reasoning",
    icon: "",
    topics: [
      {
        id: "syllogisms",
        title: "Syllogisms",
        summary: "Deductive reasoning, Venn diagram methods, and logical conclusions.",
        materials: [],
        questions: [
          {
            id: "syl-q1",
            qNumber: 1,
            questionText: `Statements:
1. Some mangoes are yellow.
2. Some tixo are mangoes.

Conclusions:
I. Some mangoes are green.
II. Tixo is a yellow.`,
            options: [
              "Only (I) conclusion follows",
              "Only (II) conclusion follows",
              "Either (I) or (II) follows",
              "Neither (I) nor (II) follows"
            ],
            correctOption: 3,
            explanation: `From the statements:
- Nothing is stated about green mangoes, so Conclusion I cannot be assumed.
- No direct overlap between Tixo and yellow is guaranteed, so Conclusion II does not follow necessarily.

Hence, neither (I) nor (II) follows. Option D.`,
            difficulty: "Medium"
          }
        ]
      },
      {
        id: "blood-relations",
        title: "Blood Relations",
        summary: "Family tree analysis, maternal/paternal relationships, and coded relations.",
        materials: [],
        questions: [
          {
            id: "br-q1",
            qNumber: 1,
            questionText: "Pointing to a photograph of a boy Suresh said, 'He is the son of the only son of my mother.' How is Suresh related to that boy?",
            options: [
              "Brother",
              "Uncle",
              "Cousin",
              "Father"
            ],
            correctOption: 3,
            explanation: `Break down the statement:
• 'The only son of my mother' = Suresh himself.
• 'He is the son of Suresh'
Therefore, Suresh is the father of the boy. Option D is correct.`,
            difficulty: "Easy"
          }
        ]
      }
    ]
  },
  {
    category: "Computer Science & Programming",
    icon: "",
    topics: [
      {
        id: "react-19",
        title: "React 19 & Frontend",
        summary: "React 19 features, Actions, Hooks, Server Components, and state management.",
        materials: [
          {
            id: "real-react-pdf",
            title: "Pioneer - Mastering React 19 Cheatsheet.pdf",
            type: "pdf",
            url: "/docs/react-cheatsheet.pdf",
            size: "678 KB",
            uploadedAt: "2026-11-10"
          }
        ],
        questions: [
          {
            id: "react-q1",
            qNumber: 1,
            questionText: "In React, which hook is used to perform side effects like data fetching or DOM subscriptions?",
            options: [
              "useState",
              "useEffect",
              "useMemo",
              "useCallback"
            ],
            correctOption: 1,
            explanation: "useEffect is specifically designed to handle side effects in functional components.",
            difficulty: "Easy"
          }
        ]
      },
      {
        id: "full-stack-web",
        title: "Full Stack Web Development",
        summary: "Roadmap, architecture, client-server models, and RESTful APIs.",
        materials: [
          {
            id: "real-webdev-pdf",
            title: "Pioneer - Complete Web Dev Roadmap.pdf",
            type: "pdf",
            url: "/docs/web-dev-roadmap.pdf",
            size: "684 KB",
            uploadedAt: "2026-11-10"
          }
        ],
        questions: [
          {
            id: "web-q1",
            qNumber: 1,
            questionText: "Which HTTP status code signifies that a resource was successfully created on the server?",
            options: [
              "200 OK",
              "201 Created",
              "204 No Content",
              "301 Moved Permanently"
            ],
            correctOption: 1,
            explanation: "HTTP 201 Created is the standard response when an action results in the creation of a new resource (such as via POST).",
            difficulty: "Easy"
          }
        ]
      },
      {
        id: "c-programming",
        title: "C Language & Pointers",
        summary: "Pointers, memory allocation, arrays, strings, and standard C library functions.",
        materials: [],
        questions: [
          {
            id: "c-q1",
            qNumber: 1,
            questionText: `What will be the output of the following C code snippet?

#include <stdio.h>
int main() {
    int arr[] = {10, 20, 30, 40};
    int *ptr = arr;
    printf("%d", *(ptr + 2));
    return 0;
}`,
            options: [
              "10",
              "20",
              "30",
              "40"
            ],
            correctOption: 2,
            explanation: `• 'arr' decays to pointer to its first element (index 0, value 10).
• 'ptr + 2' moves the pointer forward by 2 integer sizes, pointing to arr[2].
• Dereferencing *(ptr + 2) yields 30.
Option C is correct.`,
            difficulty: "Easy"
          },
          {
            id: "c-q2",
            qNumber: 2,
            questionText: "Which of the following functions is used to release dynamically allocated memory in C?",
            options: [
              "delete()",
              "free()",
              "release()",
              "dispose()"
            ],
            correctOption: 1,
            explanation: `In standard C (<stdlib.h>), memory allocated with malloc(), calloc(), or realloc() must be freed using free().
Option B is correct.`,
            difficulty: "Easy"
          }
        ]
      },
      {
        id: "data-structures",
        title: "Data Structures & Algorithms",
        summary: "Arrays, Linked Lists, Stacks, Queues, Binary Trees, and Asymptotic Complexity.",
        materials: [],
        questions: [
          {
            id: "dsa-q1",
            qNumber: 1,
            questionText: "What is the worst-case time complexity of searching an element in a Balanced Binary Search Tree?",
            options: [
              "O(1)",
              "O(log n)",
              "O(n)",
              "O(n log n)"
            ],
            correctOption: 1,
            explanation: `In a self-balancing BST (like AVL or Red-Black Tree), tree height is guaranteed to be O(log n).
Search takes O(log n) time.
Option B is correct.`,
            difficulty: "Medium"
          }
        ]
      }
    ]
  },
  {
    category: "Placement Papers & Interviews",
    icon: "",
    topics: [
      {
        id: "tcs-nqt",
        title: "TCS NQT Placement Set",
        summary: "Frequently asked aptitude and verbal patterns for TCS National Qualifier Test.",
        materials: [],
        questions: [
          {
            id: "tcs-q1",
            qNumber: 1,
            questionText: "A person covers a distance of 12 km at 4 km/h and another 15 km at 5 km/h. What is his average speed for the whole journey?",
            options: [
              "4.2 km/h",
              "4.5 km/h",
              "4.6 km/h",
              "4.8 km/h"
            ],
            correctOption: 1,
            explanation: `Total distance = 12 + 15 = 27 km.
Time 1 = 12 / 4 = 3 hours. Time 2 = 15 / 5 = 3 hours.
Total time = 6 hours.
Average speed = 27 / 6 = 4.5 km/h.
Option B is correct.`,
            difficulty: "Easy"
          }
        ]
      }
    ]
  },
  
];
