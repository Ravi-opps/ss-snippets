Here is a simplified, easy-to-remember version of the **Dijkstra's Algorithm / Link State Routing** program.

It keeps the core routing logic intact while stripping away extra arrays, path tracing, and redundant input checks to make it short enough to write quickly in exams.

```c
#include <stdio.h>
#define INF 9999

int main() {
    int cost[10][10], dist[10], vis[10] = {0};
    int n, src, u, min;

    printf("Enter number of routers: ");
    scanf("%d", &n);

    printf("Enter cost matrix (9999 for INF):\n");
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            scanf("%d", &cost[i][j]);

    printf("Enter source router (0 to %d): ", n - 1);
    scanf("%d", &src);

    // Initialize distance array from source
    for (int i = 0; i < n; i++)
        dist[i] = cost[src][i];

    dist[src] = 0;
    vis[src] = 1;

    // Main Dijkstra Loop
    for (int count = 1; count < n; count++) {
        min = INF;
        u = -1;

        // Find unvisited node with minimum distance
        for (int i = 0; i < n; i++) {
            if (!vis[i] && dist[i] < min) {
                min = dist[i];
                u = i;
            }
        }

        if (u == -1) break;
        vis[u] = 1;

        // Relax neighbors
        for (int j = 0; j < n; j++) {
            if (!vis[j] && dist[u] + cost[u][j] < dist[j])
                dist[j] = dist[u] + cost[u][j];
        }
    }

    // Print shortest costs
    printf("\nShortest distances from Router %d:\n", src);
    for (int i = 0; i < n; i++)
        printf("To Router %d = %d\n", i, dist[i]);

    return 0;
}

```

---

### Key Shortcuts Used:

1. **Removed Path Reconstruction:** Removed `parent[]`, `path[]`, and the `while` trace loop. Most lab evaluation schemes only check for the shortest distance calculation rather than printing the full `0 -> 1 -> 3` arrow path.
2. **Simplified Arrays & Matrix Size:** Replaced `MAX` macro with a fixed size of `10` and initialized `vis[10] = {0}` directly to clear visited flags in one shot.
3. **Streamlined Loops:** Collapsed nested input loops into single-line statements without multi-line brace structures.



Here is a simplified, exam-ready version of the **CIDR / Classless Addressing** C program. It gets rid of heavy library functions like `inet_pton`, `ntohl`, and `inet_ntoa`, using direct standard C instead.

```c
#include <stdio.h>
#include <math.h>

int main() {
    int a, b, c, d, p;

    printf("Enter IP (e.g. 192.168.1.15) and Prefix length (e.g. 24): ");
    scanf("%d.%d.%d.%d %d", &a, &b, &c, &d, &p);

    unsigned int ip = (a << 24) | (b << 16) | (c << 8) | d;
    unsigned int mask = (p == 0) ? 0 : 0xFFFFFFFF << (32 - p);

    unsigned int net = ip & mask;
    unsigned int last = net | (~mask);

    printf("\n--- CIDR Details ---\n");
    printf("Subnet Mask  : %d.%d.%d.%d\n", (mask>>24)&255, (mask>>16)&255, (mask>>8)&255, mask&255);
    printf("First Address: %d.%d.%d.%d\n", (net>>24)&255, (net>>16)&255, (net>>8)&255, net&255);
    printf("Last Address : %d.%d.%d.%d\n", (last>>24)&255, (last>>16)&255, (last>>8)&255, last&255);
    printf("Total Hosts  : %.0f\n", pow(2, 32 - p));

    return 0;
}

```

---

### Tricks used to shorten:

1. **Direct `scanf` Parsing:** `scanf("%d.%d.%d.%d %d", ...)` reads the IP octets and prefix directly into integer variables in one line without network header libraries (`<arpa/inet.h>`).
2. **Bit Shifting to Combine IP:** `(a << 24) | (b << 16) | (c << 8) | d` converts the IP into a single 32-bit unsigned integer instantly.
3. **Bitwise Unpacking for Print:** `(val >> bit) & 255` extracts each octet to display IPs in standard dot notation.
4. **`pow(2, 32 - p)`:** Uses `<math.h>` to compute total addresses quickly without ternary type casting logic.



Here is a simplified, exam-ready version of the **CIDR / Classless Addressing** C program. It gets rid of heavy library functions like `inet_pton`, `ntohl`, and `inet_ntoa`, using direct standard C instead.

```c
#include <stdio.h>
#include <math.h>

int main() {
    int a, b, c, d, p;

    printf("Enter IP (e.g. 192.168.1.15) and Prefix length (e.g. 24): ");
    scanf("%d.%d.%d.%d %d", &a, &b, &c, &d, &p);

    unsigned int ip = (a << 24) | (b << 16) | (c << 8) | d;
    unsigned int mask = (p == 0) ? 0 : 0xFFFFFFFF << (32 - p);

    unsigned int net = ip & mask;
    unsigned int last = net | (~mask);

    printf("\n--- CIDR Details ---\n");
    printf("Subnet Mask  : %d.%d.%d.%d\n", (mask>>24)&255, (mask>>16)&255, (mask>>8)&255, mask&255);
    printf("First Address: %d.%d.%d.%d\n", (net>>24)&255, (net>>16)&255, (net>>8)&255, net&255);
    printf("Last Address : %d.%d.%d.%d\n", (last>>24)&255, (last>>16)&255, (last>>8)&255, last&255);
    printf("Total Hosts  : %.0f\n", pow(2, 32 - p));

    return 0;
}

```

---

### Tricks used to shorten:

1. **Direct `scanf` Parsing:** `scanf("%d.%d.%d.%d %d", ...)` reads the IP octets and prefix directly into integer variables in one line without network header libraries (`<arpa/inet.h>`).
2. **Bit Shifting to Combine IP:** `(a << 24) | (b << 16) | (c << 8) | d` converts the IP into a single 32-bit unsigned integer instantly.
3. **Bitwise Unpacking for Print:** `(val >> bit) & 255` extracts each octet to display IPs in standard dot notation.
4. **`pow(2, 32 - p)`:** Uses `<math.h>` to compute total addresses quickly without ternary type casting logic.


Here is the absolute simplest C program for Distance Vector Routing.

It strips away extra structs and functions, keeping only the core Bellman-Ford algorithm update formula: `dist[i][j] = dist[i][k] + dist[k][j]`.

```c
#include <stdio.h>

#define INF 999
#define N 4

int main() {
    // 1. Initial cost matrix representing direct links between routers
    int matrix[N][N] = {
        {0,   1,   1,   INF},
        {1,   0,   INF, 1},
        {1,   INF, 0,   1},
        {INF, 1,   1,   0}
    };

    // Copy matrix to routing distance table
    int dist[N][N];
    for (int i = 0; i < N; i++)
        for (int j = 0; j < N; j++)
            dist[i][j] = matrix[i][j];

    // 2. Distance Vector Algorithm (Bellman-Ford update)
    // Every node shares its vector with neighbors until paths converge
    for (int k = 0; k < N; k++)          // Intermediate node
        for (int i = 0; i < N; i++)      // Source node
            for (int j = 0; j < N; j++)  // Destination node
                if (dist[i][k] + dist[k][j] < dist[i][j])
                    dist[i][j] = dist[i][k] + dist[k][j];

    // 3. Print final converged distance vectors
    printf("Final Shortest Distance Matrix:\n");
    printf("   From\\To  0  1  2  3\n");
    printf("   -------------------\n");
    for (int i = 0; i < N; i++) {
        printf("   Node %d |", i);
        for (int j = 0; j < N; j++) {
            printf("%3d", dist[i][j]);
        }
        printf("\n");
    }

    return 0;
}

```

### Output

```text
Final Shortest Distance Matrix:
   From\To  0  1  2  3
   -------------------
   Node 0 |  0  1  1  2
   Node 1 |  1  0  2  1
   Node 2 |  1  2  0  1
   Node 3 |  2  1  1  0

```

### How it works:

* **`dist[i][j]`** stores the best-known distance from Router `i` to Router `j`.
* **The 3 nested loops** evaluate if routing traffic through an intermediate Router `k` gives a shorter total distance than the current direct path.



Here is a shortened version of your program. It replaces the repetitive `if-else` block with an array of structures, keeping the core logic clear, concise, and easy to maintain.

```c
#include <stdio.h>

typedef struct {
    int max;
    char class_name;
    char *mask;
    int net_bits;
    int host_bits;
    long hosts;
} ClassInfo;

int main() {
    int octet;
    printf("Enter the first octet: ");
    if (scanf("%d", &octet) != 1 || octet < 1 || octet > 255 || octet == 127) {
        printf("Invalid or Loopback IP address\n");
        return 0;
    }

    // Lookup table matching the upper bound of each class range
    ClassInfo classes[] = {
        {126, 'A', "255.0.0.0",     8,  24, 16777214},
        {191, 'B', "255.255.0.0",   16, 16, 65534},
        {223, 'C', "255.255.255.0", 24, 8,  254},
        {239, 'D', NULL,             0,  0,  0},
        {255, 'E', NULL,             0,  0,  0}
    };

    for (int i = 0; i < 5; i++) {
        if (octet <= classes[i].max) {
            printf("Class %c\n", classes[i].class_name);
            if (classes[i].mask) {
                printf("Default Subnet Mask: %s\nNetwork Bits: %d\nHost Bits: %d\nNumber of Hosts per Network: %ld\n",
                       classes[i].mask, classes[i].net_bits, classes[i].host_bits, classes[i].hosts);
            } else {
                printf("%s\n", (classes[i].class_name == 'D') ? "Used for Multicasting" : "Reserved for Experimental Purpose");
            }
            break;
        }
    }
    return 0;
}

```

### Key Logic Improvements

* **Lookup Table (`struct` array):** Replaces repetitive `printf` statements by grouping all data attributes together per class.
* **Range Comparison (`octet <= max`):** Since ranges are ordered sequentially (`<= 126`, `<= 191`, `<= 223`, etc.), checking only the upper limit automatically handles the lower bound.
* **Input Validation:** Handles out-of-bounds values (`< 1` or `> 255`) and explicitly excludes `127` (Loopback address).