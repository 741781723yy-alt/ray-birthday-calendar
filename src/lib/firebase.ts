import { initializeApp } from 'firebase/app';
import { getFirestore, enableIndexedDbPersistence } from 'firebase/firestore';

// 🔧 请替换为你的 Firebase 项目配置
// 获取方式：Firebase Console → 项目设置 → 你的应用 → 配置
const firebaseConfig = {
  apiKey: 'AIzaSyB9Htnd150DaExYdgXXV4zudbEAW2Sn4WA',
  authDomain: 'xuyuanxx-821ec.firebaseapp.com',
  projectId: 'xuyuanxx-821ec',
  storageBucket: 'xuyuanxx-821ec.firebasestorage.app',
  messagingSenderId: '728270939036',
  appId: '1:728270939036:web:a9479132d06e6d015b5e59',
  measurementId: 'G-NXM4XBZXCW',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// 启用离线持久化，网络恢复后自动同步
enableIndexedDbPersistence(db).catch(() => {
  // 多标签页时可能失败，忽略即可
});
