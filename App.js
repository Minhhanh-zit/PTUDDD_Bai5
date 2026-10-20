import { Ionicons } from "@expo/vector-icons";

import React, { useCallback, useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
} from "react-native";

import {
  NavigationContainer,
  useFocusEffect,
} from "@react-navigation/native";

import {
  createNativeStackNavigator,
} from "@react-navigation/native-stack";

import {
  SafeAreaProvider,
  SafeAreaView,
} from "react-native-safe-area-context";

import CourseListScreen from "./src/screens/CourseListScreen";
import CourseDetailScreen from "./src/screens/CourseDetailScreen";
import CourseFormScreen from "./src/screens/CourseFormScreen";
import CategoryScreen from "./src/screens/CategoryScreen";
import TrailerScreen from "./src/screens/TrailerScreen";

import { deleteCourse } from "./src/services/courseService";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  const [refreshKey, setRefreshKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setRefreshKey((value) => value + 1);
    }, [])
  );

  return (
    <SafeAreaView
      style={styles.container}
      edges={["top", "bottom"]}
    >
      <CourseListScreen
        key={refreshKey}
        navigation={navigation}
      />

      <TouchableOpacity
        style={styles.categoryButton}
        onPress={() => navigation.navigate("Categories")}
      >
        <Ionicons name="albums-outline" size={18} color="#58466F" />
        <Text style={styles.categoryButtonText}>Danh mục</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.addButton}
        onPress={() => navigation.navigate("CourseForm")}
      >
        <Text style={styles.addText}>
          + Thêm khóa học
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function DetailScreen({ route, navigation }) {
  const [deleting, setDeleting] = useState(false);

  const courseId = route.params?.courseId;

  const handleDelete = () => {
    Alert.alert(
      "Xác nhận xóa",
      "Bạn có chắc muốn xóa khóa học này không?",
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Xóa",
          style: "destructive",
          onPress: async () => {
            if (deleting) return;

            setDeleting(true);

            try {
              await deleteCourse(courseId);

              Alert.alert(
                "Thành công",
                "Đã xóa khóa học."
              );

              navigation.popToTop();
            } catch (error) {
              Alert.alert(
                "Lỗi",
                error.message || "Không thể xóa."
              );
            } finally {
              setDeleting(false);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView
      style={styles.container}
      edges={["bottom"]}
    >
      <CourseDetailScreen
        route={route}
        navigation={navigation}
      />

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.editButton}
          disabled={deleting}
          onPress={() =>
            navigation.navigate("CourseForm", {
              courseId,
            })
          }
        >
          <Ionicons name="create-outline" size={22} color="#58466F" />
          <Text style={styles.actionText}>Sửa</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          disabled={deleting}
          onPress={handleDelete}
        >
          {deleting ? (
            <ActivityIndicator color="#514366" />
          ) : (
            <>
              <Ionicons name="trash-outline" size={22} color="#58466F" />
              <Text style={styles.actionText}>Xóa</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar barStyle="dark-content" />

        <Stack.Navigator
          initialRouteName="CourseList"
          screenOptions={{
            headerTintColor: "#58466F",
            headerBackTitle: "Quay lại",
            headerStyle: {
              backgroundColor: "#FFFDFE",
            },
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen
            name="CourseList"
            component={HomeScreen}
            options={{ headerShown: false }}
          />

          <Stack.Screen
            name="CourseDetail"
            component={DetailScreen}
            options={{
              title: "Chi tiết khóa học",
            }}
          />

          <Stack.Screen
            name="Categories"
            component={CategoryScreen}
            options={{ title: "Quản lý danh mục" }}
          />

          <Stack.Screen
            name="CourseForm"
            component={CourseFormScreen}
            options={({ route }) => ({
              title: route.params?.courseId
                ? "Sửa khóa học"
                : "Thêm khóa học",
            })}
          />

          <Stack.Screen
            name="Trailer"
            component={TrailerScreen}
            options={{
              title: "Xem trailer",
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  categoryButton: {
    position: "absolute",
    bottom: 20,
    left: 16,
    paddingVertical: 15,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 30,
    backgroundColor: "#BCE8D6",
  },
  categoryButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#58466F",
  },
  container: {
    flex: 1,
    backgroundColor: "#FAF7FF",
  },

  addButton: {
    position: "absolute",
    right: 18,
    bottom: 20,
    backgroundColor: "#C7B5EE",
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 5,
    shadowColor: "#000000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },

  addText: {
    color: "#514366",
    fontSize: 15,
    fontWeight: "bold",
  },

  actions: {
    flexDirection: "row",
    padding: 14,
    gap: 12,
    backgroundColor: "#FFFDFE",
    borderTopWidth: 1,
    borderTopColor: "#EDE5F6",
  },

  editButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flex: 1,
    backgroundColor: "#FFD8C6",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  deleteButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    flex: 1,
    backgroundColor: "#F6C3D1",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },

  actionText: {
    color: "#514366",
    fontSize: 16,
    fontWeight: "bold",
  },
});
