export const kafkaMeta = {
  title: "Kafka Lab Notes",
  tagline:
    "Batch scripts, fault tolerance, topic operations, Kafka Connect, and Streams — straight from the lab PDFs.",
  eyebrow: "Study notes / Apache Kafka",
};

const code = (label, body) => ({ label, body, kind: "code" });
const output = (body) => ({ label: "output", body, kind: "output" });

export const kafkaSections = [
  {
    id: "program-6",
    index: "06",
    pdf: "Program 6 kafka Script.pdf",
    title: "Create a Kafka Topic Using a Batch Script",
    aim: "Write a Windows batch script that creates a Kafka topic with a fixed partition count and replication factor, then verify it from the command line.",
    steps: [
      {
        title: "Create a file",
        body: "Create a file named create-topic.bat.",
        blocks: [],
      },
      {
        title: "Add this script",
        body: "Paste the following commands into create-topic.bat.",
        blocks: [
          code(
            "create-topic.bat",
            String.raw`@echo off

set KAFKA_BIN=C:\kafka\bin\windows
set BOOTSTRAP_SERVER=localhost:9092

set TOPIC_NAME=my-topic
set PARTITIONS=6
set REPLICATION_FACTOR=1

"%KAFKA_BIN%\kafka-topics.bat" ^
  --bootstrap-server %BOOTSTRAP_SERVER% ^
  --create ^
  --topic %TOPIC_NAME% ^
  --partitions %PARTITIONS% ^
  --replication-factor %REPLICATION_FACTOR%

pause`
          ),
        ],
      },
      {
        title: "Execute the script",
        body: "Open CMD and run the script.",
        blocks: [code("cmd", "create-topic.bat")],
      },
      {
        title: "Verify topic creation",
        body: "List the topics on the broker to confirm my-topic exists.",
        blocks: [
          code(
            "cmd",
            String.raw`cd C:\kafka\bin\windows
kafka-topics.bat --bootstrap-server localhost:9092 --list`
          ),
        ],
      },
    ],
    tables: [
      {
        title: "Explanation of commands",
        columns: ["Command", "Purpose"],
        rows: [
          ["@echo off", "Hides commands while executing."],
          ["set KAFKA_BIN=...", "Stores Kafka's installation path."],
          ["set BOOTSTRAP_SERVER=...", "Specifies the Kafka broker address."],
          ["set TOPIC_NAME=my-topic", "Sets the topic name."],
          ["set PARTITIONS=6", "Creates 6 partitions."],
          ["set REPLICATION_FACTOR=1", "Creates 1 copy of each partition."],
          ["--create", "Creates a new topic."],
          ["pause", "Waits for a key press before closing."],
        ],
      },
    ],
    notes: {
      title: "Important",
      items: [
        "The Kafka broker must be running before executing the script. Also, replication factor cannot exceed the number of available brokers.",
        "In this setup there is one broker (localhost:9092) holding six partitions, and each partition has exactly one copy because the replication factor is 1.",
        "Partitions provide parallelism: six partitions allow up to six consumers in the same consumer group to process data in parallel.",
        "Replication provides fault tolerance: with replication factor 1, if that broker crashes all six partitions become unavailable.",
        "With three brokers and replication factor 3, each partition would have three copies distributed across the brokers.",
      ],
    },
  },
  {
    id: "program-7",
    index: "07",
    pdf: "program 7 fault tolerance simulation.pdf",
    title: "Simulate Fault Tolerance in Kafka",
    aim: "Simulate fault tolerance by shutting down one broker and observing how the cluster and its replicas behave.",
    steps: [
      {
        title: "Start the controller and 3 brokers",
        body: "Open four separate CMD windows and run one command in each.",
        blocks: [
          code("CMD 1 — Controller", String.raw`kafka-server-start.bat C:\kafka\config\controller.properties`),
          code("CMD 2 — Broker 1", String.raw`kafka-server-start.bat C:\kafka\config\broker1.properties`),
          code("CMD 3 — Broker 2", String.raw`kafka-server-start.bat C:\kafka\config\broker2.properties`),
          code("CMD 4 — Broker 3", String.raw`kafka-server-start.bat C:\kafka\config\broker3.properties`),
        ],
        note: "This starts one controller and three brokers in the Kafka cluster.",
      },
      {
        title: "Create a topic with replication factor 3",
        body: "The topic gets three partitions and three copies of each partition across the brokers.",
        blocks: [
          code(
            "cmd",
            "kafka-topics.bat --create --topic fault-test --bootstrap-server kafka1:9092 --partitions 3 --replication-factor 3"
          ),
        ],
      },
      {
        title: "Check the topic",
        body: "Describe the topic to display partition leaders, replicas, and ISR (in-sync replicas).",
        blocks: [
          code(
            "cmd",
            "kafka-topics.bat --describe --topic fault-test --bootstrap-server kafka1:9092"
          ),
          output(
            String.raw`Partition: 0 Leader: 1 Replicas: 1,2,3 ISR: 1,2,3
Partition: 1 Leader: 2 Replicas: 2,3,1 ISR: 2,3,1
Partition: 2 Leader: 3 Replicas: 3,1,2 ISR: 3,1,2`
          ),
        ],
      },
      {
        title: "Produce messages",
        body: "Open the console producer, type messages, and press Enter to send each one.",
        blocks: [
          code(
            "cmd",
            "kafka-console-producer.bat --topic fault-test --bootstrap-server kafka1:9092"
          ),
        ],
      },
      {
        title: "Shut down one broker",
        body: "Go to the CMD window running Broker 2 and press Ctrl + C. Broker 1 and Broker 3 continue running.",
        blocks: [code("keyboard", "Ctrl + C")],
      },
      {
        title: "Check the topic again",
        body: "Broker 2 is unavailable, so it is removed from the ISR. Another in-sync replica becomes the leader if necessary.",
        blocks: [
          code(
            "cmd",
            "kafka-topics.bat --describe --topic fault-test --bootstrap-server kafka1:9092"
          ),
          output(
            String.raw`Replicas: 1,2,3
ISR: 1,3`
          ),
        ],
      },
      {
        title: "Restart Broker 2",
        body: "Broker 2 rejoins the cluster and catches up with the other replicas. After some time, check again.",
        blocks: [
          code("cmd", String.raw`kafka-server-start.bat C:\kafka\config\broker2.properties`),
          code(
            "cmd",
            "kafka-topics.bat --describe --topic fault-test --bootstrap-server kafka1:9092"
          ),
          output("ISR: 1,2,3"),
        ],
      },
      {
        title: "Consume messages",
        body: "Read all previously produced messages, starting from the beginning.",
        blocks: [
          code(
            "cmd",
            "kafka-console-consumer.bat --topic fault-test --from-beginning --bootstrap-server kafka1:9092"
          ),
        ],
      },
    ],
    tables: [
      {
        title: "Broker status",
        columns: ["Broker", "Before failure", "During Broker 2 failure"],
        rows: [
          ["Broker 1", "Running", "Running"],
          ["Broker 2", "Running", "Failed"],
          ["Broker 3", "Running", "Running"],
        ],
      },
      {
        title: "Key observations",
        columns: ["Stage", "Result"],
        rows: [
          ["Normal", "All replicas in ISR"],
          ["Broker 2 stopped", "Kafka elects new leaders if needed"],
          ["During failure", "Messages remain available"],
          ["Broker 2 restarted", "Replica catches up"],
        ],
      },
    ],
    notes: {
      title: "Important concept",
      items: [
        "Messages remain available through surviving replicas while Broker 2 is down.",
        "Replication provides fault tolerance. If the replication factor is 1, shutting down the only broker containing a partition makes that partition unavailable.",
      ],
    },
  },
  {
    id: "program-8",
    index: "08",
    pdf: "Program 8 Implement operations such as listing topics.pdf",
    title: "Implement Kafka Operations",
    aim: "Implement common operations such as listing topics, describing a topic, modifying configurations, and deleting topics.",
    steps: [
      {
        title: "List all topics",
        body: "Displays all topics available in the Kafka broker.",
        blocks: [code("cmd", "kafka-topics.bat --bootstrap-server localhost:9092 --list")],
      },
      {
        title: "Describe a topic",
        body: "Displays topic details such as partitions, leaders, replicas, and ISR.",
        blocks: [
          code(
            "cmd",
            "kafka-topics.bat --bootstrap-server localhost:9092 --describe --topic mytopic"
          ),
        ],
      },
      {
        title: "Modify topic configuration",
        body: "Set the retention period to 24 hours (86,400,000 milliseconds).",
        blocks: [
          code(
            "cmd",
            "kafka-configs.bat --bootstrap-server localhost:9092 --entity-type topics --entity-name mytopic --alter --add-config retention.ms=86400000"
          ),
        ],
      },
      {
        title: "View topic configuration",
        body: "Displays the current configuration of the specified topic.",
        blocks: [
          code(
            "cmd",
            "kafka-configs.bat --bootstrap-server localhost:9092 --entity-type topics --entity-name mytopic --describe"
          ),
        ],
      },
      {
        title: "Remove custom retention configuration",
        body: "Removes the custom retention setting and reverts to the broker's default retention period.",
        blocks: [
          code(
            "cmd",
            "kafka-configs.bat --bootstrap-server localhost:9092 --entity-type topics --entity-name mytopic --alter --delete-config retention.ms"
          ),
        ],
      },
      {
        title: "Delete a topic",
        body: "Deletes the specified topic from Kafka.",
        blocks: [
          code("cmd", "kafka-topics.bat --bootstrap-server localhost:9092 --delete --topic mytopic"),
        ],
      },
    ],
    tables: [
      {
        title: "Quick revision",
        columns: ["Operation", "Command"],
        rows: [
          ["List topics", "--list"],
          ["Describe topic", "--describe"],
          ["Modify configuration", "--alter --add-config"],
          ["View configuration", "--describe"],
          ["Remove configuration", "--alter --delete-config"],
          ["Delete topic", "--delete"],
        ],
      },
    ],
    notes: {
      title: "Note",
      items: [
        "Replace mytopic with the actual topic name you created. Make sure your Kafka broker is running on localhost:9092.",
      ],
    },
  },
  {
    id: "program-9",
    index: "09",
    pdf: "Program 9 Kafka Connector.pdf",
    title: "Implement Kafka Connect",
    aim: "Introduce Kafka Connect and demonstrate how to integrate Kafka with external systems without writing separate producer and consumer programs.",
    concept:
      "Kafka Connect transfers data between Kafka and external systems. In this experiment the flow is: input file → Kafka topic → output file.",
    steps: [
      {
        title: "Start Kafka broker",
        body: "Starts the Kafka broker.",
        blocks: [code("cmd", String.raw`kafka-server-start.bat C:\kafka\config\server.properties`)],
      },
      {
        title: "Create a Kafka topic",
        body: "Creates a topic named student-data to store student records.",
        blocks: [
          code(
            "cmd",
            "kafka-topics.bat --create --topic student-data --bootstrap-server localhost:9092"
          ),
        ],
      },
      {
        title: "Create the input file",
        body: String.raw`Inside C:\kafka, create a file named students.txt. This file acts as the external data source.`,
        blocks: [
          code(
            "students.txt",
            `101, Ravi, CSE
102, Priya, ECE
103, Arun, IT`
          ),
        ],
      },
      {
        title: "Configure the source connector",
        body: String.raw`Inside C:\kafka, create source.properties. The source connector reads records from students.txt and publishes them to the student-data topic.`,
        blocks: [
          code(
            "source.properties",
            `name=student-file-source
connector.class=org.apache.kafka.connect.file.FileStreamSourceConnector
tasks.max=1
file=C:/kafka/students.txt
topic=student-data`
          ),
        ],
      },
      {
        title: "Configure the sink connector",
        body: String.raw`Inside C:\kafka, create sink.properties. The sink connector reads records from Kafka and writes them into output.txt.`,
        blocks: [
          code(
            "sink.properties",
            `name=student-file-sink
connector.class=org.apache.kafka.connect.file.FileStreamSinkConnector
tasks.max=1
file=C:/kafka/output.txt
topics=student-data`
          ),
        ],
      },
      {
        title: "Start Kafka Connect",
        body: "Open a new CMD window and start Kafka Connect with both the source and sink connectors.",
        blocks: [
          code(
            "cmd",
            String.raw`connect-standalone.bat ^
C:\kafka\config\connect-standalone.properties ^
C:\kafka\source.properties ^
C:\kafka\sink.properties`
          ),
        ],
        note: "Source connector: File → Kafka. Sink connector: Kafka → File.",
      },
      {
        title: "Verify the output",
        body: String.raw`Open another CMD window and consume the topic. Also open C:\kafka\output.txt — it should contain the same records.`,
        blocks: [
          code(
            "cmd",
            "kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic student-data --from-beginning"
          ),
          output(
            `101, Ravi, CSE
102, Priya, ECE
103, Arun, IT`
          ),
        ],
      },
    ],
    flow: [
      "students.txt",
      "external data source",
      "source connector",
      "kafka topic · student-data",
      "sink connector",
      "output.txt",
      "external destination",
    ],
    tables: [
      {
        title: "Quick revision",
        columns: ["Component", "Purpose"],
        rows: [
          ["Source connector", "Imports data into Kafka"],
          ["Sink connector", "Exports data from Kafka"],
          ["Task", "Performs actual data transfer"],
          ["Worker", "Runs connectors and tasks"],
          ["REST API", "Manages connectors using HTTP requests"],
        ],
      },
    ],
    notes: {
      title: "Important",
      items: [
        "Kafka Connect is the framework; source and sink connectors are the components that actually move data.",
        "The PDF uses the built-in FileStream connectors. They must be available in your Kafka installation.",
        "The PDF has a small naming inconsistency: it initially says student-data but creates File_connect. Use student-data consistently as shown here.",
      ],
    },
  },
  {
    id: "program-10",
    index: "10",
    pdf: "Program 10 Kafka Streams.pdf",
    title: "Word Count with Kafka Streams",
    aim: "Implement a simple word count application using Kafka Streams that reads text messages from an input Kafka topic, counts the occurrences of each word, and publishes the updated counts to an output Kafka topic.",
    concept:
      "Kafka Streams reads lines from TextLinesTopic, splits each line into words, groups by word, and keeps a running count. The counts are written to WordsWithCountsTopic with String keys and Long values.",
    files: [
      {
        title: "Add the dependency — pom.xml",
        body: "Add the Kafka Streams dependency to the project's pom.xml.",
        block: code(
          "pom.xml",
          `<dependency>
    <groupId>org.apache.kafka</groupId>
    <artifactId>kafka-streams</artifactId>
    <version>4.3.1</version>
</dependency>`
        ),
      },
      {
        title: "Java program — WordCount.java",
        body: "Place WordCount.java in the org.example package.",
        block: code(
          "WordCount.java",
          String.raw`package org.example;

import org.apache.kafka.streams.KafkaStreams;
import org.apache.kafka.streams.StreamsBuilder;
import org.apache.kafka.streams.Topology;
import org.apache.kafka.streams.kstream.KStream;
import org.apache.kafka.streams.kstream.KTable;
import org.apache.kafka.streams.StreamsConfig;
import org.apache.kafka.common.serialization.Serdes;

import java.util.List;
import java.util.Properties;

public class WordCount {
    public static void main(String[] args) {
        // Set up Kafka Streams configuration
        Properties props = new Properties();
        props.put(StreamsConfig.APPLICATION_ID_CONFIG, "word-count");
        props.put(StreamsConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092");
        props.put(StreamsConfig.DEFAULT_KEY_SERDE_CLASS_CONFIG,
                Serdes.String().getClass());
        props.put(StreamsConfig.DEFAULT_VALUE_SERDE_CLASS_CONFIG,
                Serdes.String().getClass());

        // Build the processing topology
        StreamsBuilder builder = new StreamsBuilder();

        // Step 1: Read the stream of lines from the input Kafka topic
        KStream<String, String> textLines = builder.stream("TextLinesTopic");

        // Step 2: Split lines into words, group by word, and count occurrences
        KTable<String, Long> wordCounts = textLines
                .peek((key, value) ->
                        System.out.println("Input: key=" + key + ", value=" + value))
                .flatMapValues(value -> List.of(value.toLowerCase().split("\\W+"))) // Split the line into words
                .peek((key, word) ->
                        System.out.println("After split: word=" + word))
                .groupBy((key, word) -> word) // Group by word (value)
                .count(); // Count occurrences of each word

        // Step 3: Output the word counts to a Kafka topic
        wordCounts.toStream()
                .peek((word, count) ->
                        System.out.println("Word Count: word=" + word + ", count=" + count))
                .to("WordsWithCountsTopic",
                        org.apache.kafka.streams.kstream.Produced.with(
                                Serdes.String(),
                                Serdes.Long()));

        // Build and start the Kafka Streams application
        Topology topo = builder.build();
        //System.out.println(topo.describe());
        KafkaStreams streams = new KafkaStreams(topo, props);
        streams.cleanUp();
        streams.start();

        // Add shutdown hook to close the stream gracefully
        Runtime.getRuntime().addShutdownHook(new Thread(streams::close));
    }
}`
        ),
      },
    ],
    steps: [
      {
        title: "Start the Kafka server",
        body: "Open a second terminal and start the Kafka broker.",
        blocks: [code("cmd", String.raw`kafka-server-start.bat C:\kafka\config\server.properties`)],
      },
      {
        title: "Create the two topics",
        body: "Create the input topic TextLinesTopic and the output topic WordsWithCountsTopic.",
        blocks: [
          code(
            "cmd",
            "kafka-topics.bat --create --topic WordsWithCountsTopic --bootstrap-server localhost:9092"
          ),
          code(
            "cmd",
            "kafka-topics.bat --create --topic TextLinesTopic --bootstrap-server localhost:9092"
          ),
        ],
      },
      {
        title: "Start a console producer",
        body: "Open the producer and type some messages.",
        blocks: [
          code(
            "cmd",
            "kafka-console-producer.bat --topic TextLinesTopic --bootstrap-server localhost:9092"
          ),
          code(
            "producer input",
            `hello world hello kafka
kafka is good kafka is powerful`
          ),
        ],
      },
      {
        title: "Compile the Kafka Streams Java code in VS Code",
        body: "From the project folder, compile the application with Maven.",
        blocks: [
          code(
            "cmd",
            `cd demo
mvn clean compile`
          ),
        ],
      },
      {
        title: "Start the word count application",
        body: "Run the WordCount main class with the Maven exec plugin.",
        blocks: [
          code("cmd", 'mvn exec:java "-Dexec.mainClass=org.example.WordCount"'),
        ],
      },
      {
        title: "Type more messages in the producer window",
        body: "Send another line so the application keeps updating the counts.",
        blocks: [code("producer input", "kafka is great students love coding in kafka")],
      },
      {
        title: "Start the consumer",
        body: "Read the counts from WordsWithCountsTopic with the simpler console consumer command.",
        blocks: [
          code(
            "cmd",
            "kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic WordsWithCountsTopic --from-beginning --property print.key=true --property print.value=true"
          ),
          output(
            `kafka : 2
is : 1
great : 1
students : 1
love : 1
coding : 1
in : 1`
          ),
        ],
        note: "Input at producer: kafka is great students love coding in kafka",
      },
    ],
    flow: [
      "TextLinesTopic",
      "KStream · split + groupBy",
      "count()",
      "WordsWithCountsTopic",
    ],
    notes: {
      title: "How it works",
      items: [
        "flatMapValues splits every input line into lowercase words, then groupedBy feeds each word into count().",
        "The word-count application ID identifies this streams job and its local state store; cleanUp() clears any previous local state before starting.",
        "Counts are produced with String keys and Long values; print.key and print.value make the console consumer display both.",
        "The shutdown hook closes the KafkaStreams instance cleanly when the process stops.",
      ],
    },
  },
];
