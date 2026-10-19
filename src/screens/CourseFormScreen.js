
import React, { useEffect, useState } from "react";

import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from "react-native";

import {
  getCourseById,
  addCourse,
  updateCourse,
} from "../services/courseService";

import { getCategories } from "../services/categoryService";

const DEFAULT_TRAILER =
  "https://www.youtube.com/watch?v=pQdU_B-OJOg";

export default function CourseFormScreen({
  route,
  navigation,
}) {
  const courseId = route.params?.courseId;
  const isEdit = courseId != null;

  const [form, setForm] = useState({
    title: "",
    description: "",
    instructor: "",
    price: "",
    duration: "",
    categoryId: "",
    thumbnail: "",
    trailerUrl: DEFAULT_TRAILER,
    createdAt: "",
  });

  const [categories, setCategories] = useState([]);
  const [showCategories, setShowCategories] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [imageError, setImageError] = useState(false);

  const updateField = (key, value) => {
    setForm((old) => ({
      ...old,
      [key]: value,
    }));

    if (key === "thumbnail") {
      setImageError(false);
    }
  };

  useEffect(() => {
    let active = true;

    async function loadData() {
      try {
        const categoryData = await getCategories();

        if (!Array.isArray(categoryData)) {
          throw new Error("Dữ liệu danh mục không hợp lệ.");
        }

        const course = isEdit
          ? await getCourseById(courseId)
          : null;

        if (!active) return;

        setCategories(categoryData);

        if (course) {
          setForm({
            title: String(course.title || ""),
            description: String(course.description || ""),
            instructor: String(course.instructor || ""),
            price: String(course.price ?? ""),
            duration: String(course.duration ?? ""),
            categoryId: String(course.categoryId || ""),
            thumbnail: String(course.thumbnail || ""),
            trailerUrl: String(course.trailerUrl || ""),
            createdAt: String(course.createdAt || ""),
          });
        } else if (categoryData.length > 0) {
          updateField(
            "categoryId",
            String(categoryData[0].id)
          );
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Không tải được dữ liệu.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [courseId, isEdit]);

  const handleSave = async () => {
    if (saving) return;

    const required = [
      "title",
      "description",
      "instructor",
      "price",
      "duration",
      "thumbnail",
      "trailerUrl",
    ];

    if (required.some((key) => !String(form[key]).trim())) {
      Alert.alert(
        "Thiếu thông tin",
        "Vui lòng nhập đầy đủ các trường bắt buộc."
      );
      return;
    }

    const price = Number(form.price);
    const duration = Number(form.duration);

    if (!Number.isFinite(price) || price < 0) {
      Alert.alert(
        "Học phí không hợp lệ",
        "Học phí phải là số không âm."
      );
      return;
    }

    if (!Number.isFinite(duration) || duration <= 0) {
      Alert.alert(
        "Thời lượng không hợp lệ",
        "Thời lượng phải lớn hơn 0."
      );
      return;
    }

    if (!/^https?:\/\/\S+$/i.test(form.thumbnail.trim())) {
      Alert.alert(
        "URL ảnh không hợp lệ",
        "Đường dẫn ảnh phải bắt đầu bằng http hoặc https."
      );
      return;
    }

    if (imageError) {
      Alert.alert(
        "Ảnh không hợp lệ",
        "Không tải được ảnh bìa. Hãy kiểm tra lại URL."
      );
      return;
    }

    const youtubeId = form.trailerUrl.match(
      /(?:[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
    );

    if (
      !/^https?:\/\//i.test(form.trailerUrl) ||
      !youtubeId
    ) {
      Alert.alert(
        "Trailer không hợp lệ",
        "Hãy nhập đường dẫn YouTube hợp lệ."
      );
      return;
    }

    setSaving(true);

    try {
      const latestCategories = await getCategories();

      const exists = latestCategories.some(
        (category) =>
          String(category.id) === String(form.categoryId)
      );

      if (!exists) {
        Alert.alert(
          "Danh mục không hợp lệ",
          "Danh mục đã chọn không còn tồn tại."
        );
        return;
      }

      const data = {
        title: form.title.trim(),
        description: form.description.trim(),
        instructor: form.instructor.trim(),
        price,
        duration,
        categoryId: String(form.categoryId),
        thumbnail: form.thumbnail.trim(),
        trailerUrl: form.trailerUrl.trim(),
        createdAt: isEdit
          ? form.createdAt
          : new Date().toISOString(),
      };

      if (isEdit) {
        await updateCourse(courseId, data);
      } else {
        await addCourse(data);
      }

      Alert.alert(
        "Thành công",
        isEdit
          ? "Đã cập nhật khóa học."
          : "Đã thêm khóa học.",
        [
          {
            text: "OK",
            onPress: () => navigation.popToTop(),
          },
        ]
      );
    } catch (err) {
      Alert.alert(
        "Lỗi",
        err.message || "Không thể lưu khóa học."
      );
    } finally {
      setSaving(false);
    }
  };

  const renderInput = (label, key, options = {}) => (
    <View style={styles.field}>
      <Text style={styles.label}>{label} *</Text>

      <TextInput
        style={[
          styles.input,
          options.multiline && styles.multiline,
        ]}
        placeholder={`Nhập ${label.toLowerCase()}`}
        placeholderTextColor="#A396B3"
        value={form[key]}
        onChangeText={(value) => updateField(key, value)}
        keyboardType={
          options.numeric ? "numeric" : "default"
        }
        multiline={options.multiline || false}
        textAlignVertical="top"
        autoCapitalize={options.url ? "none" : "sentences"}
        autoCorrect={!options.url}
      />
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#C7B5EE" />
        <Text>Đang tải biểu mẫu...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error}</Text>
      </View>
    );
  }

  const selectedCategory = categories.find(
    (item) =>
      String(item.id) === String(form.categoryId)
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={90}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.heading}>
          {isEdit ? "Chỉnh sửa khóa học" : "Thêm khóa học"}
        </Text>

        <Text style={styles.subtitle}>
          Nhập thông tin bên dưới để lưu vào MockAPI
        </Text>

        {renderInput("Tên khóa học", "title")}

        {renderInput("Mô tả", "description", {
          multiline: true,
        })}

        {renderInput("Giảng viên", "instructor")}

        {renderInput("Học phí (VNĐ)", "price", {
          numeric: true,
        })}

        {renderInput("Thời lượng (giờ)", "duration", {
          numeric: true,
        })}

        <Text style={styles.label}>Danh mục *</Text>

        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowCategories(true)}
        >
          <Text style={styles.selectedText}>
            {selectedCategory?.name || "Chọn danh mục"} ▾
          </Text>
        </TouchableOpacity>

        <Modal
          transparent
          visible={showCategories}
          animationType="fade"
          onRequestClose={() => setShowCategories(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>
                Chọn danh mục
              </Text>

              {categories.map((category) => (
                <TouchableOpacity
                  key={String(category.id)}
                  style={styles.option}
                  onPress={() => {
                    updateField(
                      "categoryId",
                      String(category.id)
                    );
                    setShowCategories(false);
                  }}
                >
                  <Text style={styles.optionText}>
                    {category.name}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.option}
                onPress={() => setShowCategories(false)}
              >
                <Text style={styles.error}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {renderInput("URL ảnh bìa", "thumbnail", {
          url: true,
        })}

        {/^https?:\/\//i.test(form.thumbnail.trim()) &&
          !imageError && (
            <Image
              source={{ uri: form.thumbnail.trim() }}
              style={styles.preview}
              resizeMode="cover"
              onError={() => setImageError(true)}
            />
          )}

        {imageError && (
          <Text style={styles.error}>
            Không thể tải ảnh xem trước.
          </Text>
        )}

        {renderInput("URL trailer YouTube", "trailerUrl", {
          url: true,
        })}

        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && { opacity: 0.6 },
          ]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color="#514366" />
          ) : (
            <Text style={styles.saveText}>
              {isEdit ? "Lưu thay đổi" : "+ Thêm khóa học"}
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7FF",
  },
  content: {
    padding: 18,
    paddingBottom: 60,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  heading: {
    fontSize: 25,
    fontWeight: "bold",
    color: "#58466F",
  },
  subtitle: {
    color: "#7A6D8A",
    marginTop: 6,
    marginBottom: 22,
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5B4C6E",
    marginBottom: 9,
  },
  input: {
    backgroundColor: "#FFFDFE",
    borderWidth: 1,
    borderColor: "#EDE5F6",
    borderRadius: 12,
    padding: 14,
    fontSize: 15,
    color: "#514366",
    marginBottom: 8,
  },
  multiline: {
    height: 110,
  },
  selectedText: {
    fontSize: 15,
    color: "#58466F",
  },
  preview: {
    width: "100%",
    height: 180,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: "#EDE5F6",
  },
  saveButton: {
    backgroundColor: "#C7B5EE",
    borderRadius: 12,
    padding: 17,
    alignItems: "center",
    marginTop: 20,
  },
  saveText: {
    color: "#514366",
    fontSize: 16,
    fontWeight: "bold",
  },
  error: {
    color: "#B15573",
    marginBottom: 10,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    padding: 25,
  },
  modalBox: {
    backgroundColor: "#FFFDFE",
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#58466F",
    marginBottom: 15,
  },
  option: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EDE5F6",
  },
  optionText: {
    color: "#5B4C6E",
    fontSize: 16,
  },
});
