import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { getCourseById } from "../services/courseService";
import { getCategories } from "../services/categoryService";

export default function CourseDetailScreen({ route, navigation }) {
  const { courseId } = route.params;

  const [course, setCourse] = useState(null);
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadDetail() {
      try {
        const [courseData, categories] = await Promise.all([
          getCourseById(courseId),
          getCategories(),
        ]);

        if (!active) return;

        setCourse(courseData);

        const category = categories.find(
          (item) =>
            String(item.id) === String(courseData.categoryId)
        );

        setCategoryName(
          category?.name || "Không xác định"
        );
      } catch (err) {
        if (active) {
          setError(err.message || "Không tải được khóa học.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadDetail();

    return () => {
      active = false;
    };
  }, [courseId]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C7B5EE" />
        <Text>Đang tải chi tiết...</Text>
      </View>
    );
  }

  if (error || !course) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>
          {error || "Không tìm thấy khóa học."}
        </Text>
      </View>
    );
  }

  const price = Number(course.price);
  const priceText = Number.isFinite(price)
    ? price.toLocaleString("vi-VN") + " đ"
    : "Chưa cập nhật";

  const date = new Date(course.createdAt);
  const dateText = Number.isNaN(date.getTime())
    ? "Chưa cập nhật"
    : date.toLocaleDateString("vi-VN");

  const videoUrl = String(course.trailerUrl || "").trim();
  const hasVideo = /^https?:\/\//i.test(videoUrl);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {course.thumbnail && !imageError ? (
        <Image
          source={{ uri: course.thumbnail }}
          style={styles.image}
          resizeMode="cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <View style={styles.placeholder}>
          <Text>Không có ảnh bìa</Text>
        </View>
      )}

      <Text style={styles.title}>{course.title}</Text>
      <Text style={styles.price}>{priceText}</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Danh mục</Text>
        <Text style={styles.value}>{categoryName}</Text>

        <Text style={styles.label}>Giảng viên</Text>
        <Text style={styles.value}>{course.instructor}</Text>

        <Text style={styles.label}>Thời lượng</Text>
        <Text style={styles.value}>{course.duration} giờ</Text>

        <Text style={styles.label}>Ngày tạo</Text>
        <Text style={styles.value}>{dateText}</Text>
      </View>

      <Text style={styles.sectionTitle}>
        Giới thiệu khóa học
      </Text>

      <Text style={styles.description}>
        {course.description || "Chưa có mô tả."}
      </Text>

      <TouchableOpacity
        disabled={!hasVideo}
        style={[
          styles.videoButton,
          !hasVideo && styles.disabledButton,
        ]}
        onPress={() =>
          navigation.navigate("Trailer", {
            videoUrl,
            title: course.title,
          })
        }
      >
        <Text style={styles.buttonText}>
          {hasVideo ? "▶ Xem trailer" : "Chưa có trailer"}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7FF",
  },
  content: {
    padding: 18,
    paddingBottom: 45,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    padding: 20,
  },
  error: {
    color: "#B15573",
    textAlign: "center",
  },
  image: {
    width: "100%",
    height: 210,
    borderRadius: 16,
    backgroundColor: "#EDE5F6",
  },
  placeholder: {
    height: 210,
    backgroundColor: "#EDE5F6",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#58466F",
    marginTop: 20,
  },
  price: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#477B69",
    marginVertical: 16,
  },
  infoBox: {
    backgroundColor: "#FFFDFE",
    borderRadius: 16,
    padding: 18,
  },
  label: {
    color: "#7A6D8A",
    fontSize: 13,
    marginTop: 10,
  },
  value: {
    color: "#514366",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#58466F",
    marginTop: 24,
    marginBottom: 10,
  },
  description: {
    color: "#71667E",
    fontSize: 15,
    lineHeight: 25,
  },
  videoButton: {
    backgroundColor: "#C7B5EE",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 28,
  },
  disabledButton: {
    backgroundColor: "#A396B3",
  },
  buttonText: {
    color: "#514366",
    fontSize: 16,
    fontWeight: "bold",
  },
});
