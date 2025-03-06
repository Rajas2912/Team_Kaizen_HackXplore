from datetime import date, timedelta

def schedule_lectures(syllabus, start_date, end_date, lectures_per_week):
    # Validate input parameters
    if not all(isinstance(v, dict) for v in syllabus.values()):
        raise ValueError("Invalid syllabus format")
    
    if not isinstance(start_date, date) or not isinstance(end_date, date):
        raise ValueError("Invalid date format")
    
    if start_date > end_date:
        raise ValueError("Start date must be before end date")
    
    if lectures_per_week < 1:
        raise ValueError("Lectures per week must be a positive integer")

    # Generate all possible lecture days (Monday and Wednesday) within the date range
    lecture_days = []
    current_date = start_date
    while current_date <= end_date:
        if current_date.weekday() in [0, 2]:  # Monday is 0, Tuesday is 1, ..., Sunday is 6
            lecture_days.append(current_date)
        current_date += timedelta(days=1)

    # Process each lecture individually
    all_topics = []
    for lecture in syllabus.values():
        all_topics.extend(lecture["topics"])

    total_topics = len(all_topics)

    # Calculate the number of full weeks and leftover topics for revision
    if lectures_per_week == 0:
        raise ValueError("Lectures per week cannot be zero")
    
    num_full_weeks = (total_topics - 1) // lectures_per_week

    remaining_topics = total_topics % lectures_per_week

    # Create the schedule
    lecture_schedule = {}
    current_week = 1

    for week in range(num_full_weeks):
        start_topic_idx = week * lectures_per_week + 1
        end_topic_idx = (week + 1) * lectures_per_week

        if end_topic_idx > total_topics:
            break

        # Assign the topics to this week, considering lecture numbers and topics per lecture
        current_lecture_number = None
        for i in range(start_topic_idx-1, end_topic_idx):
            if all_topics[i]["lecture_number"] == current_lecture_number:
                pass
            else:
                current_lecture_number = all_topics[i]["lecture_number"]
        
        if current_lecture_number is not None:
            lecture_schedule[current_week] = {
                "lecture_number": current_lecture_number,
                "topics": all_topics[start_topic_idx-1:end_topic_idx]
            }
            current_week += 1

    # Handle any remaining topics for revision at the end
    if remaining_topics > 0 and num_full_weeks >= 1:
        revision_topics = []
        for i in range(-remaining_topics, len(all_topics)):
            if all_topics[i]["lecture_number"] is None:
                revision_topics.append(all_topics[i])
        
        last_full_lecture = max(lecture_schedule.values(), key=lambda x: x["topics"])["topics"][-1] if lecture_schedule else []
        next_lecture_day = (max([date for date in lecture_days], default=None) + timedelta(days=2))

        # Check if the next lecture day is within the end date
        while next_lecture_day <= end_date:
            if len(revision_topics) == remaining_topics:
                break
            
            lecture_schedule[current_week] = {
                "lecture_number": None,
                "topics": revision_topics
            }
            current_week += 1

    return {"lectures": lecture_schedule, "revisions": {}}

# Example usage with your syllabus:
syllabus = {
    "lectures": [
{
      "lecture_number": 1,
      "topics": [
        "Introduction to Computer Networks",
        "LAN, MAN, WAN, PAN, Ad hoc Networks"
      ]
    },
    {
      "lecture_number": 2,
      "topics": [
        "Network Architectures: Client-Server, Peer-to-Peer",
        "Network Topologies: Bus, Ring, Tree, Star, Mesh, Hybrid"
      ]
    },
    {
      "lecture_number": 3,
      "topics": [
        "Communication Models: OSI Model"
      ]
    },
    {
      "lecture_number": 4,
      "topics": [
        "Communication Models: TCP/IP Model",
        "Design Issues for Layers"
      ]
    },
    {
      "lecture_number": 5,
      "topics": [
        "Physical Layer: Transmission Media (Guided and Unguided)"
      ]
    },
    {
      "lecture_number": 6,
      "topics": [
        "Physical Layer: Transmission Modes (Simplex, Half Duplex, Full Duplex)"
      ]
    },
    {
      "lecture_number": 7,
      "topics": [
        "Physical Layer: Network Devices (Hub, Repeater, Bridge)"
      ]
    },
    {
      "lecture_number": 8,
      "topics": [
        "Physical Layer: Network Devices (Switch, Router, Gateway, Brouter)"
      ]
    },
    {
      "lecture_number": 9,
      "topics": [
        "Physical Layer: Spread Spectrum Signal, FHSS, DSSS"
      ]
    },
    {
      "lecture_number": 10,
      "topics": [
        "Data Link Layer: Logical Link Control (LLC) - Services, Framing"
      ]
    },
    {
      "lecture_number": 11,
      "topics": [
        "Data Link Layer: LLC - Framing Challenges and Types"
      ]
    },
    {
      "lecture_number": 12,
      "topics": [
        "Data Link Layer: LLC - Error Control, Parity Bits, Hamming Codes, CRC"
      ]
    },
    {
      "lecture_number": 13,
      "topics": [
        "Data Link Layer: Flow Control Protocols (Unrestricted Simplex, Stop and Wait, Sliding Window)"
      ]
    },
    {
      "lecture_number": 14,
      "topics": [
        "Data Link Layer: WAN Connectivity (PPP and HDLC)"
      ]
    },
    {
      "lecture_number": 15,
      "topics": [
        "Medium Access Control: Channel Allocation (Static and Dynamic)"
      ]
    },
    {
      "lecture_number": 16,
      "topics": [
        "Medium Access Control: Multiple Access Protocols (ALOHA, CSMA, WDMA)"
      ]
    },
    {
      "lecture_number": 17,
      "topics": [
        "Medium Access Control: IEEE 802.3 Standards and Frame Formats, CSMA/CD"
      ]
    },
    {
      "lecture_number": 18,
      "topics": [
        "Network Layer: Switching Techniques, IP Protocol, IPv4 and IPv6 Addressing"
      ]
    },
    {
      "lecture_number": 19,
      "topics": [
        "Network Layer: Subnetting, NAT, CIDR, ICMP"
      ]
    },
    {
      "lecture_number": 20,
      "topics": [
        "Network Layer: Routing Protocols (Distance Vector, Link State, Path Vector)"
      ]
    },
    {
      "lecture_number": 21,
      "topics": [
        "Network Layer: Routing in Internet (RIP, OSPF, BGP), Congestion Control, QoS"
      ]
    },
    {
      "lecture_number": 22,
      "topics": [
        "Transport Layer: Services, Berkeley Sockets, Addressing, Connection Establishment/Release"
      ]
    },
    {
      "lecture_number": 23,
      "topics": [
        "Transport Layer: Flow Control, Buffering, Multiplexing, TCP, TCP Timer Management, QoS, Differentiated Services, TCP/UDP for Wireless"
      ]
    },
    {
      "lecture_number": 24,
      "topics": [
        "Application Layer: DNS, HTTP, Email (SMTP, MIME, POP3, Webmail), FTP, TELNET"
      ]
    },
    {
      "lecture_number": 25,
      "topics": [
        "Application Layer: DHCP, SNMP"
      ]
    }
    ]
}


start_date = date(2025, 2, 1)
end_date = date(2025, 5, 15)
lectures_per_week = 3

schedule_result = schedule_lectures(syllabus, start_date, end_date, lectures_per_week)

# Print the result
print(" Lecture Schedule:")
for week, topics in schedule_result["lectures"].items():
    print(f" Week {week}: {topics}")
print("\n Revision Topics (if any):")
schedule_result["revisions"]
