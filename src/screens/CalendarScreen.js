import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ScrollView,
  Image
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const HELP_IO_BLACK = "#000000";

export default function CalendarScreen() {

const jobs = [
  { day: "Monday", title: "Jet Ski Engine Repair", time: "2:00 PM" },
  { day: "Tuesday", title: "Dock Electrical Fix", time: "11:00 AM" },
  { day: "Wednesday", title: "Hull Inspection", time: "9:30 AM" },
  { day: "Thursday", title: "Fuel System Service", time: "3:00 PM" },
  { day: "Friday", title: "Battery Replacement", time: "1:00 PM" },
];

return (
  <SafeAreaView style={styles.safe}>
    <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />

    <View style={styles.container}>

      {/* Calendar Card (same Helpio Pay card style) */}
      <View style={styles.cardShadow}>
  <View style={styles.calendarCard}>

   <Text style={styles.calendarTitle}>September</Text>

<View style={styles.weekRow}>
  <Text style={styles.weekDay}>Sun</Text>
  <Text style={styles.weekDay}>Mon</Text>
  <Text style={styles.weekDay}>Tue</Text>
  <Text style={styles.weekDay}>Wed</Text>
  <Text style={styles.weekDay}>Thu</Text>
  <Text style={styles.weekDay}>Fri</Text>
  <Text style={styles.weekDay}>Sat</Text>
</View>

<View style={styles.calendarGrid}>
  {[...Array(30)].map((_, i) => (
    <Text key={i} style={styles.calendarDate}>
      {i + 1}
    </Text>
  ))}
</View>

  </View>
</View>

      {/* Weekly Summary */}
      <View style={styles.amountBlock}>
        <Text style={styles.weekHeader}>This Week</Text>
        <Text style={styles.weekHint}>{jobs.length} Jobs Scheduled</Text>
      </View>

      {/* Job List */}
      <ScrollView style={styles.jobList} showsVerticalScrollIndicator={false}>
        {jobs.map((job, index) => (
          <View key={index} style={styles.jobRow}>
            <View>
              <Text style={styles.jobDay}>{job.day}</Text>
              <Text style={styles.jobTitle}>{job.title}</Text>
            </View>

            <Text style={styles.jobTime}>{job.time}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom Buttons (same style as Helpio Pay) */}
      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.primaryButton}>
          <Text style={styles.primaryText}>Add Job</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton}>
          <Ionicons name="calendar-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

    </View>
  </SafeAreaView>
);
}

const styles = StyleSheet.create({

safe:{
flex:1,
backgroundColor:"#F2F2F7"
},

container:{
flex:1,
paddingTop:Platform.OS==="ios"?16:24,
paddingHorizontal:8
},

calendarCard: {
  height: 260,
  borderRadius: 28,
  backgroundColor: "#0A0A0A",
  paddingHorizontal: 28,
  paddingVertical: 26,
  justifyContent: "flex-start",
},


cardShadow:{
borderRadius:28,
overflow:"visible",
marginTop:24,
marginBottom:40,
marginHorizontal:-8,

shadowColor:"#000",
shadowOpacity:0.55,
shadowRadius:45,
shadowOffset:{width:0,height:26},
elevation:18
},

cardImage:{
width:"104%",
height:240,
borderRadius:28,
alignSelf:"center"
},

calendarGrid:{
  flexDirection:"row",
  flexWrap:"wrap",
  marginTop:10
},

calendarDate:{
  width:"14.28%",
  textAlign:"center",
  color:"#fff",
  fontSize:16,
  fontWeight:"600",
  marginVertical:6
},

calendarTitle:{
  color:"#fff",
  fontSize:20,
  fontWeight:"700",
  marginBottom:18
},

weekRow:{
  flexDirection:"row",
  justifyContent:"space-between",
  marginTop:14
},

weekDay:{
color:"rgba(255,255,255,0.7)",
fontSize:13,
fontWeight:"600"
},

weekDate:{
color:"#fff",
fontSize:16,
fontWeight:"700"
},

amountBlock:{
marginBottom:12,
alignItems:"center"
},

weekHeader:{
fontSize:34,
fontWeight:"800",
color:"#111"
},

weekHint:{
marginTop:6,
color:"#A0A0A5",
fontSize:14
},

jobList:{
marginTop:10
},

jobRow:{
flexDirection:"row",
justifyContent:"space-between",
alignItems:"center",
paddingVertical:16,
paddingHorizontal:24,
borderBottomWidth:1,
borderBottomColor:"#E5E5EA"
},

jobDay:{
fontSize:13,
color:"#8E8E93",
marginBottom:2
},

jobTitle:{
fontSize:16,
fontWeight:"600",
color:"#111"
},

jobTime:{
fontSize:15,
fontWeight:"600",
color:"#8E8E93"
},

bottomBar:{
flexDirection:"row",
alignItems:"center",
marginTop:18,
marginBottom:10
},

primaryButton:{
flex:1,
height:52,
borderRadius:26,
backgroundColor:HELP_IO_BLACK,
alignItems:"center",
justifyContent:"center",
marginRight:10
},

primaryText:{
color:"#fff",
fontSize:17,
fontWeight:"700"
},

secondaryButton:{
width:52,
height:52,
borderRadius:26,
backgroundColor:HELP_IO_BLACK,
alignItems:"center",
justifyContent:"center"
}

});