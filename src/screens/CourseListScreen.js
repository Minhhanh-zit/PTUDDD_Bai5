import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  View,
  Text,
  TextInput,
  FlatList,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import CourseCard from "../components/CourseCard";
import { getCourses } from "../services/courseService";
import { getCategories } from "../services/categoryService";

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export default function CourseListScreen({ navigation }) {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadData = useCallback(async (refresh = false) => {
    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const [courseData, categoryData] = await Promise.all([
        getCourses(),
        getCategories(),
      ]);

      if (!Array.isArray(courseData) || !Array.isArray(categoryData)) {
        throw new Error("Dữ liệu API không hợp lệ");
      }

      setCourses(courseData);
      setCategories(categoryData);
    } catch (err) {
      setError(
        err.message || "Không thể kết nối MockAPI"
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const categoryMap = useMemo(() => {
    const map = {};

    categories.forEach((item) => {
      map[String(item.id)] = item.name;
    });

    return map;
  }, [categories]);

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const matchName = normalize(course.title)
        .includes(normalize(search.trim()));

      const matchCategory =
        selectedCategory === "all" ||
        String(course.categoryId) === selectedCategory;

      return matchName && matchCategory;
    });
  }, [courses, search, selectedCategory]);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          Quản lý khóa học
        </Text>

        <Text style={styles.subtitle}>
          Khám phá các khóa học trực tuyến
        </Text>

        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm khóa học..."
          placeholderTextColor="#A396B3"
          value={search}
          onChangeText={setSearch}
        />

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {[
            { id: "all", name: "Tất cả" },
            ...categories,
          ].map((category) => {
            const active =
              selectedCategory === String(category.id);

            return (
              <TouchableOpacity
                key={String(category.id)}
                style={[
                  styles.filterButton,
                  active && styles.activeButton,
                ]}
                onPress={() =>
                  setSelectedCategory(String(category.id))
                }
              >
                <Text
                  style={[
                    styles.filterText,
                    active && styles.activeText,
                  ]}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator
            size="large"
            color="#C7B5EE"
          />
          <Text>Đang tải khóa học...</Text>
        </View>
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.error}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadData()}
          >
            <Text style={styles.retryText}>
              Thử lại
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={filteredCourses}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={styles.list}
          refreshing={refreshing}
          onRefresh={() => loadData(true)}
          ListHeaderComponent={
            <Text style={styles.count}>
              Có {filteredCourses.length} khóa học
            </Text>
          }
          ListEmptyComponent={
            <Text style={styles.empty}>
              Không tìm thấy khóa học phù hợp.
            </Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("CourseDetail", {
                  courseId: String(item.id),
                })
              }
            >
              <CourseCard
                course={item}
                categoryName={
                  categoryMap[String(item.categoryId)] ||
                  "Không xác định"
                }
              />
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7FF",
  },
  header: {
    backgroundColor: "#FFFDFE",
    padding: 16,
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#58466F",
  },
  subtitle: {
    fontSize: 14,
    color: "#7A6D8A",
    marginTop: 5,
    marginBottom: 15,
  },
  searchInput: {
    backgroundColor: "#F3EDFA",
    borderRadius: 12,
    padding: 13,
    marginBottom: 15,
    fontSize: 15,
    color: "#514366",
  },
  filterButton: {
    backgroundColor: "#EDE5F6",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
  },
  activeButton: {
    backgroundColor: "#C7B5EE",
  },
  filterText: {
    color: "#71667E",
    fontWeight: "600",
  },
  activeText: {
    color: "#514366",
  },
  list: {
    padding: 16,
    flexGrow: 1,
  },
  count: {
    color: "#7A6D8A",
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    gap: 12,
  },
  error: {
    color: "#B15573",
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: "#C7B5EE",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  retryText: {
    color: "#514366",
    fontWeight: "bold",
  },
  empty: {
    color: "#7A6D8A",
    textAlign: "center",
    marginTop: 30,
  },
});
