import { useState, useEffect } from "react";
import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export interface SampleReelsData {
  folderLink: string;
  clips: string[];
}

const DEFAULT_SAMPLE_REELS: SampleReelsData = {
  folderLink: "https://drive.google.com/drive/folders/16ZvyD8Q-jfPnxAIhS6qIH11T7zGk8f39",
  clips: [
    "https://drive.google.com/file/d/11ZlHoUb8efxEwYgHxg6D0O77FUSz7MmE/view?usp=sharing",
    "https://drive.google.com/file/d/14aOMFg6lr0SG2RHwLtbw5y6hSez0tK4o/view?usp=sharing",
    "https://drive.google.com/file/d/1JdExnNMflWdZO7BSIASNBSyLMA59E8om/view?usp=sharing",
    "https://drive.google.com/file/d/1O-fG1ZQ8g-vg_xSLffcmbUEn1k9NoSD_/view?usp=sharing"
  ]
};

export function useSampleReels() {
  const [data, setData] = useState<SampleReelsData>(DEFAULT_SAMPLE_REELS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const docRef = doc(db, "settings", "sample_reels");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const dbData = docSnap.data();
        setData({
          folderLink: dbData.folderLink || DEFAULT_SAMPLE_REELS.folderLink,
          clips: Array.isArray(dbData.clips) && dbData.clips.length > 0 
            ? dbData.clips 
            : DEFAULT_SAMPLE_REELS.clips
        });
      } else {
        setData(DEFAULT_SAMPLE_REELS);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error loading sample reels settings:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSampleReels = async (newData: SampleReelsData) => {
    const docRef = doc(db, "settings", "sample_reels");
    await setDoc(docRef, newData);
  };

  return { data, loading, updateSampleReels };
}
