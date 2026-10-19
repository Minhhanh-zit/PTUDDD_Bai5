
import React, { useState } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";

import { WebView } from "react-native-webview";

function getVideoId(url) {
  const value = String(url || "");

  const match = value.match(
    /(?:[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([A-Za-z0-9_-]{11})/
  );

  return match ? match[1] : null;
}

export default function TrailerScreen({ route }) {
  const title = route.params?.title || "Trailer";
  const videoUrl = route.params?.videoUrl || "";

  const videoId = getVideoId(videoUrl);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?playsinline=1&rel=0`
    : "";

  // Bundle ID thật của Expo Go trên iPhone.
  // Khi tạo bản iOS riêng, thay bằng Bundle ID của ứng dụng.
  const appReferer = "https://host.exp.exponent";

  const openYouTube = async () => {
    if (!videoId) return;

    try {
      await Linking.openURL(
        `https://www.youtube.com/watch?v=${videoId}`
      );
    } catch (err) {
      Alert.alert(
        "Lỗi",
        "Không thể mở YouTube."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>

      {videoId ? (
        <View style={styles.videoBox}>
          <WebView
            key={videoId}
            source={{
              uri: embedUrl,
              headers: {
                Referer: appReferer,
              },
            }}
            style={styles.webview}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            allowsFullscreenVideo={true}
            mediaPlaybackRequiresUserAction={true}
            scrollEnabled={false}
            startInLoadingState={true}
            renderLoading={() => (
              <View style={styles.loading}>
                <ActivityIndicator
                  size="large"
                  color="#514366"
                />
                <Text style={styles.loadingText}>
                  Đang tải trailer...
                </Text>
              </View>
            )}
            onLoadEnd={() => setLoading(false)}
            onError={() => {
              setLoading(false);
              setError(true);
            }}
          />
        </View>
      ) : (
        <Text style={styles.error}>
          Đường dẫn YouTube không hợp lệ.
        </Text>
      )}

      {error && (
        <Text style={styles.error}>
          Không thể tải trang video.
        </Text>
      )}

      <Text style={styles.description}>
        {loading
          ? "Đang kết nối với YouTube..."
          : "Nhấn Play trong video để xem trailer."}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={openYouTube}
        disabled={!videoId}
      >
        <Text style={styles.buttonText}>
          ▶ Mở video trên YouTube
        </Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Video được lấy từ trailerUrl trên MockAPI.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAF7FF",
    justifyContent: "center",
    padding: 16,
  },

  title: {
    color: "#514366",
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },

  videoBox: {
    width: "100%",
    aspectRatio: 16 / 9,
    backgroundColor: "#000000",
    borderRadius: 14,
    overflow: "hidden",
  },

  webview: {
    flex: 1,
    backgroundColor: "#000000",
  },

  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#000000",
  },

  loadingText: {
    color: "#514366",
  },

  description: {
    color: "#786B8A",
    textAlign: "center",
    fontSize: 14,
    marginTop: 22,
  },

  button: {
    backgroundColor: "#C7B5EE",
    padding: 17,
    borderRadius: 12,
    marginTop: 22,
    alignItems: "center",
  },

  buttonText: {
    color: "#514366",
    fontSize: 16,
    fontWeight: "bold",
  },

  error: {
    color: "#B15573",
    textAlign: "center",
    marginTop: 16,
  },

  note: {
    color: "#A396B3",
    textAlign: "center",
    marginTop: 16,
    fontSize: 12,
  },
});
