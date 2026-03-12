// src/components/IosMonthCalendarCard.js
import React, { useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HELP_IO_BLUE = "#00A6FF";

// ✅ Produces a 7x6 month grid (always) like iOS Calendar
function buildMonthGrid(year, monthIndex /* 0-11 */, weekStartsOnSunday = true) {
  const firstOfMonth = new Date(year, monthIndex, 1);
  const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

  // JS: Sun=0..Sat=6
  const firstDow = firstOfMonth.getDay();

  // Offset to align the 1st under correct weekday column
  const offset = weekStartsOnSunday
    ? firstDow
    : (firstDow + 6) % 7; // Monday-start

  // Previous month days (for faded leading cells)
  const prevMonthDays = new Date(year, monthIndex, 0).getDate();

  const cells = [];
  // 42 cells (7 cols * 6 rows)
  for (let i = 0; i < 42; i++) {
    const dayNum = i - offset + 1;

    if (dayNum < 1) {
      // previous month
      cells.push({
        key: `p-${i}`,
        day: prevMonthDays + dayNum,
        inMonth: false,
      });
    } else if (dayNum > daysInMonth) {
      // next month
      cells.push({
        key: `n-${i}`,
        day: dayNum - daysInMonth,
        inMonth: false,
      });
    } else {
      // current month
      cells.push({
        key: `c-${i}`,
        day: dayNum,
        inMonth: true,
      });
    }
  }

  // Chunk into weeks
  const weeks = [];
  for (let w = 0; w < 6; w++) {
    weeks.push(cells.slice(w * 7, w * 7 + 7));
  }
  return weeks;
}

export default function IosMonthCalendarCard({
  year = new Date().getFullYear(),
  monthIndex = new Date().getMonth(), // 0-11
  selectedDay = new Date().getDate(),
  onPrevMonth,
  onNextMonth,
  onSelectDay,
}) {
  const monthName = useMemo(() => {
    return new Date(year, monthIndex, 1).toLocaleString("en-US", {
      month: "long",
    });
  }, [year, monthIndex]);

  const weeks = useMemo(() => buildMonthGrid(year, monthIndex, true), [year, monthIndex]);

  const weekdayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <View style={styles.cardShadow}>
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={onPrevMonth}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.navBtn}
          >
            <Ionicons name="chevron-back" size={20} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>

          <Text style={styles.monthText}>{monthName}</Text>

          <TouchableOpacity
            onPress={onNextMonth}
            activeOpacity={0.7}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={styles.navBtn}
          >
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.75)" />
          </TouchableOpacity>
        </View>

        {/* Weekday labels */}
        <View style={styles.weekdayRow}>
          {weekdayLabels.map((d) => (
            <Text key={d} style={styles.weekdayText}>
              {d}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View style={styles.grid}>
          {weeks.map((week, wi) => (
            <View key={`w-${wi}`} style={styles.weekRow}>
              {week.map((cell) => {
                const isSelected = cell.inMonth && cell.day === selectedDay;
                return (
                  <TouchableOpacity
                    key={cell.key}
                    activeOpacity={0.75}
                    onPress={() => {
                      if (!cell.inMonth) return;
                      onSelectDay?.(cell.day);
                    }}
                    style={styles.dayCell}
                  >
                    <View style={[styles.dayPill, isSelected && styles.dayPillSelected]}>
                      <Text
                        style={[
                          styles.dayText,
                          !cell.inMonth && styles.dayTextDim,
                          isSelected && styles.dayTextSelected,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // ✅ Same heavy shadow vibe as your Helpio Pay cardShadow
  cardShadow: {
    borderRadius: 28,
    marginTop: 24,
    marginBottom: 40,
    marginHorizontal: -8,

    shadowColor: "#000",
    shadowOpacity: 0.55,
    shadowRadius: 45,
    shadowOffset: { width: 0, height: 26 },
    elevation: 18,
  },

  // ✅ Card body (dark iOS/Walet style)
  card: {
    height: 240,
    borderRadius: 28,
    backgroundColor: "#0A0A0A",
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 16,
    overflow: "hidden",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  navBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.04)",
  },
  monthText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  weekdayRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  weekdayText: {
    width: "14.2857%",
    textAlign: "center",
    color: "rgba(255,255,255,0.55)",
    fontSize: 13,
    fontWeight: "600",
  },

  grid: {
    flex: 1,
    justifyContent: "space-between",
  },
  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  dayCell: {
    width: "14.2857%",
    alignItems: "center",
    justifyContent: "center",
  },

  // pill keeps iOS spacing consistent
  dayPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  dayPillSelected: {
    backgroundColor: HELP_IO_BLUE,
    shadowColor: HELP_IO_BLUE,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
  },

  dayText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  dayTextDim: {
    color: "rgba(255,255,255,0.22)",
    fontWeight: "600",
  },
  dayTextSelected: {
    color: "#fff",
  },
});