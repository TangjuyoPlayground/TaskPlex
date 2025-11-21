import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomeDashboard } from './pages/HomeDashboard';
import { VideoScreen } from './pages/VideoScreen';
import { ImageScreen } from './pages/ImageScreen';
// PDF Module
import { PDFDashboard } from './pages/pdf/PDFDashboard';
import { PDFCompress } from './pages/pdf/PDFCompress';
import { PDFMerge } from './pages/pdf/PDFMerge';
import { PDFSplit } from './pages/pdf/PDFSplit';
import { PDFReorganize } from './pages/pdf/PDFReorganize';

// Placeholders for other screens
const Placeholder = ({ title }: { title: string }) => (
  <div className="p-10 text-center text-gray-400">
    <h2 className="text-2xl font-bold mb-2">{title}</h2>
    <p>Coming soon...</p>
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomeDashboard />} />
          <Route path="video" element={<VideoScreen />} />
          <Route path="image" element={<ImageScreen />} />
          
          {/* PDF Module Routes */}
          <Route path="pdf">
            <Route index element={<PDFDashboard />} />
            <Route path="compress" element={<PDFCompress />} />
            <Route path="merge" element={<PDFMerge />} />
            <Route path="split" element={<PDFSplit />} />
            <Route path="reorganize" element={<PDFReorganize />} />
          </Route>

          <Route path="regex" element={<Placeholder title="Regex Tester" />} />
          <Route path="units" element={<Placeholder title="Unit Converter" />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
