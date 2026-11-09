

Program 6 kafka Script.pdf
PDF
i neeed u to give me cmds and a concise step wise exp
Got it. I'll give you the commands first, followed by concise step-by-step explanations, based on your Kafka PDF.

Program 6 – Create a Kafka Topic Using a Batch Script
Step 1: Create a file
Create a file named create-topic.bat.

Step 2: Add this script
@echo off

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

pause
Step 3: Execute the script
Open CMD and run:

create-topic.bat
Step 4: Verify topic creation
cd C:\kafka\bin\windows
kafka-topics.bat --bootstrap-server localhost:9092 --list
Explanation of commands
Command

Purpose

@echo off

Hides commands while executing.

set KAFKA_BIN=...

Stores Kafka's installation path.

set BOOTSTRAP_SERVER=...

Specifies the Kafka broker address.

set TOPIC_NAME=my-topic

Sets the topic name.

set PARTITIONS=6

Creates 6 partitions.

set REPLICATION_FACTOR=1

Creates 1 copy of each partition.

--create

Creates a new topic.

pause

Waits for a key press before closing.

Important: The Kafka broker must be running before executing the script. Also, replication factor cannot exceed the number of available brokers.

Source: Your uploaded Program 6 PDF. 
Program 6 kafka Script.pdf

so here, there is only one broker and that one has like 6 partitions ,one copy each
Exactly! You've understood it correctly.

In this configuration:

1 broker – Only one Kafka broker is running (localhost:9092).

6 partitions – The topic my-topic is divided into 6 partitions.

Replication factor = 1 – Each partition has exactly one copy, with no replicas.

Think of it like this:

Kafka Broker 1 (localhost:9092)

P0

1 copy
P1

1 copy
P2

1 copy
P3

1 copy
P4

1 copy
P5

1 copy
All six partitions are hosted by the same broker.
One important distinction:

Partitions provide parallelism, whereas replication provides fault tolerance.

For example:

6 partitions allow multiple consumers in the same consumer group to process data in parallel (up to 6 consumers actively processing).

Replication factor 1 means if that broker crashes, all six partitions become unavailable.

If you had 3 brokers and replication factor 3, each partition would have 3 copies distributed across brokers.


program 7 fault tolerance simulation.pdf
PDF
same here
Program 7 – Simulate Fault Tolerance in Kafka
Aim: Simulate fault tolerance by shutting down one broker and observing cluster behaviour.

Step 1: Start the controller and 3 brokers
Open 4 separate CMD windows.

Run these commands individually:

CMD 1 – Controller

kafka-server-start.bat C:\kafka\config\controller.properties
CMD 2 – Broker 1

kafka-server-start.bat C:\kafka\config\broker1.properties
CMD 3 – Broker 2

kafka-server-start.bat C:\kafka\config\broker2.properties
CMD 4 – Broker 3

kafka-server-start.bat C:\kafka\config\broker3.properties
Explanation: Starts one controller and three brokers in the Kafka cluster.

Step 2: Create a topic with replication factor 3
kafka-topics.bat --create --topic fault-test --bootstrap-server kafka1:9092 --partitions 3 --replication-factor 3
Explanation:

Creates topic fault-test.

Creates 3 partitions.

Each partition has 3 copies distributed across the 3 brokers.

Step 3: Check the topic
kafka-topics.bat --describe --topic fault-test --bootstrap-server kafka1:9092
Explanation: Displays partition leaders, replicas and ISR.

Expected output:

Partition: 0 Leader: 1 Replicas: 1,2,3 ISR: 1,2,3
Partition: 1 Leader: 2 Replicas: 2,3,1 ISR: 2,3,1
Partition: 2 Leader: 3 Replicas: 3,1,2 ISR: 3,1,2
ISR = In-Sync Replicas (replicas that are caught up with the leader).

Step 4: Produce messages
kafka-console-producer.bat --topic fault-test --bootstrap-server kafka1:9092
Explanation: Opens the producer. Type messages and press Enter to send them.

Step 5: Shut down one broker
Go to the CMD window running Broker 2 and press:

Ctrl + C
Explanation: Simulates broker failure. Broker 1 and Broker 3 continue running.

Step 6: Check the topic again
kafka-topics.bat --describe --topic fault-test --bootstrap-server kafka1:9092
Expected ISR:

Replicas: 1,2,3
ISR: 1,3
Explanation: Broker 2 is unavailable, so it is removed from the ISR. Another in-sync replica becomes the leader if necessary.

Step 7: Restart Broker 2
kafka-server-start.bat C:\kafka\config\broker2.properties
Explanation: Broker 2 rejoins the cluster and catches up with the other replicas.

After some time, check again:

kafka-topics.bat --describe --topic fault-test --bootstrap-server kafka1:9092
Expected:

ISR: 1,2,3
Step 8: Consume messages
kafka-console-consumer.bat --topic fault-test --from-beginning --bootstrap-server kafka1:9092
Explanation: Reads all previously produced messages, starting from the beginning.

Understanding the experiment
Before broker failure

Broker 1

Running
Broker 2

Running
Broker 3

Running
During Broker 2 failure

Broker 1

Running
Broker 2

Failed
Broker 3

Running
Messages remain available through surviving replicas.

Key observations:

Stage

Result

Normal

All replicas in ISR

Broker 2 stopped

Kafka elects new leaders if needed

During failure

Messages remain available

Broker 2 restarted

Replica catches up

Important concept: Replication provides fault tolerance. If replication factor is 1, shutting down the only broker containing a partition makes that partition unavailable.

program 7 fault tolerance simulation.pdf

Program 8 Implement operations such as listing topics.pdf
PDF
same
Program 8 – Implement Kafka Operations
Aim: Implement operations such as listing topics, modifying configurations, and deleting topics.

Step 1: List all topics
kafka-topics.bat --bootstrap-server localhost:9092 --list
Explanation: Displays all topics available in the Kafka broker.

Step 2: Describe a topic
kafka-topics.bat --bootstrap-server localhost:9092 --describe --topic mytopic
Explanation: Displays topic details such as partitions, leaders, replicas and ISR.

Step 3: Modify topic configuration
Set the retention period to 24 hours.

kafka-configs.bat --bootstrap-server localhost:9092 --entity-type topics --entity-name mytopic --alter --add-config retention.ms=86400000
Explanation: Changes the topic's retention period to 24 hours (86,400,000 milliseconds).

Step 4: View topic configuration
kafka-configs.bat --bootstrap-server localhost:9092 --entity-type topics --entity-name mytopic --describe
Explanation: Displays the current configuration of the specified topic.

Step 5: Remove custom retention configuration
kafka-configs.bat --bootstrap-server localhost:9092 --entity-type topics --entity-name mytopic --alter --delete-config retention.ms
Explanation: Removes the custom retention setting and reverts to the broker's default retention period.

Step 6: Delete a topic
kafka-topics.bat --bootstrap-server localhost:9092 --delete --topic mytopic
Explanation: Deletes the specified topic from Kafka.

Quick revision
Operation

Command

List topics

--list

Describe topic

--describe

Modify configuration

--alter --add-config

View configuration

--describe

Remove configuration

--alter --delete-config

Delete topic

--delete

Note: Replace mytopic with the actual topic name you created. Make sure your Kafka broker is running on localhost:9092.

Source: Uploaded Program 8 PDF. 
Program 8 Implement operations such as listing topics.pdf


Program 9 Kafka Connector.pdf
PDF
same
Program 9 – Implement Kafka Connect
Aim: Introduce Kafka Connect and demonstrate how to integrate Kafka with external systems.

Concept: Kafka Connect transfers data between Kafka and external systems without requiring us to write separate producer and consumer programs.

In this experiment, we demonstrate:

Input File → Kafka Topic → Output File

Step 1: Start Kafka broker
Open CMD and run:

kafka-server-start.bat C:\kafka\config\server.properties
Explanation: Starts the Kafka broker.

Step 2: Create a Kafka topic
kafka-topics.bat --create --topic student-data --bootstrap-server localhost:9092
Explanation: Creates a topic named student-data to store student records.

Step 3: Create the input file
Inside C:\kafka, create a file named students.txt.

Add these records:

101, Ravi, CSE
102, Priya, ECE
103, Arun, IT
Explanation: This file acts as the external data source.

Step 4: Configure the source connector
Inside C:\kafka, create source.properties.

Add:

name=student-file-source
connector.class=org.apache.kafka.connect.file.FileStreamSourceConnector
tasks.max=1
file=C:/kafka/students.txt
topic=student-data
Explanation: The source connector reads records from students.txt and publishes them to the Kafka topic student-data.

Step 5: Configure the sink connector
Inside C:\kafka, create sink.properties.

Add:

name=student-file-sink
connector.class=org.apache.kafka.connect.file.FileStreamSinkConnector
tasks.max=1
file=C:/kafka/output.txt
topics=student-data
Explanation: The sink connector reads records from Kafka and writes them into output.txt.

Step 6: Start Kafka Connect
Open a new CMD window and run:

connect-standalone.bat ^
C:\kafka\config\connect-standalone.properties ^
C:\kafka\source.properties ^
C:\kafka\sink.properties
Explanation: Starts Kafka Connect with both source and sink connectors.

Source connector: File → Kafka.

Sink connector: Kafka → File.

Step 7: Verify the output
Open another CMD window and run:

kafka-console-consumer.bat --bootstrap-server localhost:9092 --topic student-data --from-beginning
Expected output:

101, Ravi, CSE
102, Priya, ECE
103, Arun, IT
Explanation: Displays all student records stored in the Kafka topic.

Also open:

C:\kafka\output.txt
It should contain the same records.

Understanding the architecture
students.txt

External data source
Source Connector
Kafka Topic

student-data
Sink Connector
output.txt

External destination
Quick revision
Component

Purpose

Source connector

Imports data into Kafka

Sink connector

Exports data from Kafka

Task

Performs actual data transfer

Worker

Runs connectors and tasks

REST API

Manages connectors using HTTP requests

Important: Kafka Connect is the framework; source and sink connectors are the components that actually move data.

One practical note: Your PDF uses the built-in FileStream connectors. They must be available in your Kafka installation. Also, the PDF has a small naming inconsistency: it initially says student-data but creates File_connect; use student-data consistently as shown above.

Source: Program 9 PDF. 
Program 9 Kafka Connector.pdf





