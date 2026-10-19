import React from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
} from "react-native";

export default function CourseCard({ course, categoryName }) {
  const price = Number(course.price);

  return (
    <View style={styles.card}>
      {course.thumbnail ? (
        <Image
          source={{ uri: course.thumbnail }}
          style={styles.image}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text>Chưa có ảnh</Text>
        </View>
      )}

      <View style={styles.content}>
        <Text style={styles.category}>
          {categoryName}
        </Text>

        <Text style={styles.title}>
          {course.title}
        </Text>

        <Text style={styles.instructor}>
          Giảng viên: {course.instructor}
        </Text>

        <View style={styles.bottom}>
          <Text style={styles.price}>
            {Number.isFinite(price)
              ? price.toLocaleString("vi-VN") + " đ"
              : "Chưa có giá"}
          </Text>

          <Text style={styles.duration}>
            {course.duration} giờ
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFDFE",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#EDE5F6",
  },
  image: {
    width: "100%",
    height: 170,
    backgroundColor: "#EDE5F6",
  },
  placeholder: {
    height: 170,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#EDE5F6",
  },
  content: {
    padding: 16,
  },
  category: {
    color: "#C7B5EE",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  title: {
    fontSize: 18,
    color: "#514366",
    fontWeight: "bold",
    marginBottom: 8,
  },
  instructor: {
    fontSize: 14,
    color: "#7A6D8A",
  },
  bottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 14,
  },
  price: {
    fontSize: 17,
    color: "#477B69",
    fontWeight: "bold",
  },
  duration: {
    fontSize: 13,
    color: "#7A6D8A",
  },
});
