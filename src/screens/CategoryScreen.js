import React, { useCallback, useState } from "react";
import {
  View, Text, TextInput, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Modal, KeyboardAvoidingView,
  Platform, RefreshControl, StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import {
  getCategories, addCategory, updateCategory, deleteCategory,
} from "../services/categoryService";
import { getCourses } from "../services/courseService";

const C = {
  bg: "#FAF7FF", card: "#FFFDFE", purple: "#58466F",
  muted: "#7A6D8A", border: "#EDE5F6", lavender: "#C7B5EE",
  mint: "#BCE8D6", peach: "#FFD8C6", pink: "#F6C3D1",
};

function message(error) {
  const responseMessage = error?.response?.data?.message;
  return typeof responseMessage === "string"
    ? responseMessage
    : error?.message || "Có lỗi xảy ra. Hãy thử lại.";
}

export default function CategoryScreen() {
  const [categories, setCategories] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const loadData = useCallback(async (pull = false) => {
    if (pull) setRefreshing(true);
    else setLoading(true);
    setError("");
    try {
      const [categoryData, courseData] = await Promise.all([
        getCategories(), getCourses(),
      ]);
      if (!Array.isArray(categoryData) || !Array.isArray(courseData)) {
        throw new Error("Dữ liệu API trả về không hợp lệ.");
      }
      setCategories(categoryData);
      setCourses(courseData);
    } catch (err) {
      setError(message(err));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const openForm = (category = null) => {
    setEditing(category);
    setName(category ? String(category.name || "") : "");
    setDescription(category ? String(category.description || "") : "");
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (saving) return;
    const cleanName = name.trim();
    const cleanDescription = description.trim();
    if (!cleanName || !cleanDescription) {
      Alert.alert("Thiếu thông tin", "Nhập tên và mô tả danh mục.");
      return;
    }
    setSaving(true);
    try {
      const latest = await getCategories();
      if (!Array.isArray(latest)) throw new Error("Không đọc được danh mục.");
      if (latest.some((item) =>
        String(item.name || "").trim().toLowerCase() === cleanName.toLowerCase() &&
        String(item.id) !== String(editing?.id ?? "")
      )) {
        Alert.alert("Trùng tên", "Tên danh mục đã tồn tại.");
        return;
      }
      if (editing) {
        if (!latest.some((item) => String(item.id) === String(editing.id))) {
          throw new Error("Danh mục này không còn tồn tại.");
        }
        await updateCategory(editing.id, {
          name: cleanName, description: cleanDescription,
        });
      } else {
        await addCategory({ name: cleanName, description: cleanDescription });
      }
      setModalVisible(false);
      await loadData();
      Alert.alert("Thành công", editing ? "Đã sửa danh mục." : "Đã thêm danh mục.");
    } catch (err) {
      Alert.alert("Không thể lưu", message(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteSafely = async (category) => {
    if (deletingId !== null) return;
    setDeletingId(String(category.id));
    try {
      // Luôn kiểm tra courses mới nhất từ server trước khi DELETE.
      const latestCourses = await getCourses();
      if (!Array.isArray(latestCourses)) {
        throw new Error("Không thể xác nhận khóa học liên quan.");
      }
      const linked = latestCourses.filter((course) =>
        String(course.categoryId) === String(category.id)
      );
      if (linked.length > 0) {
        Alert.alert(
          "Không thể xóa danh mục",
          `Danh mục đang có ${linked.length} khóa học. Hãy chuyển hoặc xóa các khóa học này trước.`
        );
        await loadData();
        return;
      }
      await deleteCategory(category.id);
      await loadData();
      Alert.alert("Thành công", "Đã xóa danh mục.");
    } catch (err) {
      Alert.alert("Không thể xóa", message(err));
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDelete = (category) => {
    Alert.alert(
      "Xác nhận xóa",
      `Bạn muốn xóa danh mục “${category.name}”?`,
      [
        { text: "Hủy", style: "cancel" },
        { text: "Xóa", style: "destructive", onPress: () => deleteSafely(category) },
      ]
    );
  };

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadData(true)}
            tintColor={C.purple}
          />
        }
      >
        <View style={styles.headingRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.heading}>Danh mục khóa học</Text>
            <Text style={styles.subtitle}>Dữ liệu trực tiếp từ MockAPI</Text>
          </View>
          <TouchableOpacity style={styles.addButton} onPress={() => openForm()}>
            <Ionicons name="add" size={21} color={C.purple} />
            <Text style={styles.buttonLabel}>Thêm</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={C.purple} />
            <Text style={styles.subtitle}>Đang tải dữ liệu...</Text>
          </View>
        ) : error ? (
          <View style={styles.center}>
            <Ionicons name="cloud-offline-outline" size={32} color={C.purple} />
            <Text style={styles.error}>{error}</Text>
            <TouchableOpacity style={styles.retry} onPress={() => loadData()}>
              <Text style={styles.buttonLabel}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        ) : categories.length === 0 ? (
          <View style={styles.center}>
            <Text style={styles.subtitle}>Chưa có danh mục nào. Nhấn Thêm để tạo.</Text>
          </View>
        ) : categories.map((category) => {
          const count = courses.filter((course) =>
            String(course.categoryId) === String(category.id)
          ).length;
          const busy = deletingId === String(category.id);
          return (
            <View key={String(category.id)} style={styles.card}>
              <View style={styles.cardTitleRow}>
                <View style={styles.iconSquare}>
                  <Ionicons name="library-outline" color={C.purple} size={23} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryName}>{category.name}</Text>
                  <Text style={styles.count}>{count} khóa học</Text>
                </View>
              </View>
              <Text style={styles.description}>
                {category.description || "Chưa có mô tả"}
              </Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.action, styles.edit]} onPress={() => openForm(category)} disabled={busy}>
                  <Ionicons name="create-outline" size={19} color={C.purple} />
                  <Text style={styles.buttonLabel}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.action, styles.delete]} onPress={() => confirmDelete(category)} disabled={busy}>
                  {busy ? <ActivityIndicator color={C.purple} /> : <Ionicons name="trash-outline" size={19} color={C.purple} />}
                  <Text style={styles.buttonLabel}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => !saving && setModalVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editing ? "Sửa danh mục" : "Thêm danh mục"}
            </Text>
            <Text style={styles.label}>Tên danh mục *</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: Lập trình Mobile"
              placeholderTextColor="#A396B3"
              value={name}
              onChangeText={setName}
              maxLength={100}
            />
            <Text style={styles.label}>Mô tả *</Text>
            <TextInput
              style={[styles.input, styles.inputMultiline]}
              placeholder="Nội dung danh mục..."
              placeholderTextColor="#A396B3"
              value={description}
              onChangeText={setDescription}
              multiline
              maxLength={400}
              textAlignVertical="top"
            />
            <View style={styles.actionRow}>
              <TouchableOpacity style={[styles.action, styles.cancel]} disabled={saving} onPress={() => setModalVisible(false)}>
                <Text style={styles.buttonLabel}>Hủy</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.action, styles.save]} disabled={saving} onPress={handleSave}>
                {saving ? <ActivityIndicator color={C.purple} /> : <Ionicons name="checkmark-circle-outline" size={20} color={C.purple} />}
                <Text style={styles.buttonLabel}>{editing ? "Lưu sửa" : "Thêm mới"}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg },
  content: { padding: 17, paddingBottom: 36 },
  headingRow: { flexDirection: "row", alignItems: "center", gap: 9, marginBottom: 20 },
  heading: { fontSize: 23, fontWeight: "800", color: C.purple },
  subtitle: { fontSize: 13, color: C.muted, marginTop: 5 },
  addButton: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: C.mint, paddingHorizontal: 13, paddingVertical: 12, borderRadius: 14 },
  buttonLabel: { color: C.purple, fontWeight: "700", fontSize: 14 },
  center: { alignItems: "center", justifyContent: "center", gap: 10, padding: 35 },
  error: { color: "#B15573", textAlign: "center", fontSize: 14 },
  retry: { backgroundColor: C.lavender, borderRadius: 12, padding: 12 },
  card: { backgroundColor: C.card, borderRadius: 18, padding: 17, borderWidth: 1, borderColor: C.border, marginBottom: 13 },
  cardTitleRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  iconSquare: { width: 48, height: 48, borderRadius: 14, backgroundColor: C.lavender, justifyContent: "center", alignItems: "center" },
  categoryName: { fontSize: 17, fontWeight: "800", color: C.purple },
  count: { fontSize: 13, color: C.muted, marginTop: 4 },
  description: { color: C.muted, fontSize: 14, lineHeight: 22, marginTop: 14, marginBottom: 16 },
  actionRow: { flexDirection: "row", gap: 12 },
  action: { flex: 1, flexDirection: "row", gap: 8, paddingVertical: 13, borderRadius: 13, justifyContent: "center", alignItems: "center" },
  edit: { backgroundColor: C.peach },
  delete: { backgroundColor: C.pink },
  cancel: { backgroundColor: "#EDE5F6" },
  save: { backgroundColor: C.mint },
  overlay: { flex: 1, backgroundColor: "rgba(45,30,60,0.35)", padding: 20, justifyContent: "center" },
  modalCard: { backgroundColor: C.card, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: "800", color: C.purple, marginBottom: 15 },
  label: { fontWeight: "600", color: C.purple, marginBottom: 6 },
  input: { backgroundColor: "#FFFFFF", borderColor: C.border, borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 15, fontSize: 15, color: C.purple },
  inputMultiline: { minHeight: 90 },
});