import React, { useState, useEffect, useRef } from "react";
import { Sandpack } from "@codesandbox/sandpack-react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { FaPlus, FaChevronDown, FaChevronRight, FaTrash, FaFolder, FaFolderOpen } from "react-icons/fa";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

export default function App() {
  const [files, setFiles] = useState({
    "/App.js": {
      code: `export default function App() {
  return <h1>Hello CipherStudio!</h1>;
}`,
    },
    "/index.js": {
      code: `import { createRoot } from "react-dom/client";
import App from "./App";
const root = createRoot(document.getElementById("root"));
root.render(<App />);`,
    },
  });

  const [selectedFile, setSelectedFile] = useState("/App.js");
  const [isDark, setIsDark] = useState(true);
  const [sidebarWidth, setSidebarWidth] = useState(300);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  const [user, setUser] = useState(null);
  const [userProjects, setUserProjects] = useState([]);

  const isResizing = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("cipher_project");
    if (saved) setFiles(JSON.parse(saved));

    const savedTheme = localStorage.getItem("cipher_theme");
    if (savedTheme) setIsDark(savedTheme === "dark");
    
    const savedUser = localStorage.getItem("cipher_user");
    if (savedUser) setUser(JSON.parse(savedUser));
  }, []);

  useEffect(() => {
    if (user) {
      localStorage.setItem("cipher_user", JSON.stringify(user));
      loadUserProjects();
    } else {
      localStorage.removeItem("cipher_user");
      setUserProjects([]);
    }
  }, [user]);

  const loadUserProjects = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${backendUrl}/api/projects/user`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const projects = await response.json();
        setUserProjects(projects);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    }
  };

  const loadProject = async (projectId) => {
    try {
      const response = await fetch(`${backendUrl}/api/projects/${projectId}/files`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const projectFiles = {};
        data.files.forEach(file => {
          if (file.type === 'file') {
            projectFiles[`/${file.name}`] = { code: file.content };
          }
        });
        setFiles(projectFiles);
        setSelectedFile(Object.keys(projectFiles)[0]);
      }
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem("cipher_theme", isDark ? "dark" : "light");
  }, [isDark]);

  const toggleTheme = () => setIsDark(!isDark);

  const handleMouseDown = () => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    const newWidth = e.clientX;
    if (newWidth > 200 && newWidth < 600) {
      setSidebarWidth(newWidth);
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  const saveProject = async () => {
    if (!user) {
      localStorage.setItem("cipher_project", JSON.stringify(files));
      alert("Project saved locally! Please login to save to Azure.");
      return;
    }

    try {
      const projectName = prompt("Enter project name:") || "Untitled Project";
      const projectFiles = Object.entries(files).map(([path, file]) => ({
        name: path.replace('/', ''),
        content: file.code,
        language: path.endsWith('.js') || path.endsWith('.jsx') ? 'javascript' : 'text'
      }));

      const response = await fetch(`${backendUrl}/api/projects/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          name: projectName,
          description: 'Created with CipherStudio',
          files: projectFiles
        })
      });
      
      if (response.ok) {
        alert("Project saved to Azure successfully!");
      } else {
        throw new Error(`Server error: ${response.status}`);
      }
    } catch (error) {
      alert(`Failed to save project: ${error.message}. Saved locally instead.`);
      localStorage.setItem("cipher_project", JSON.stringify(files));
    }
  };

  const addFile = () => {
    const fileName = prompt("Enter file path (e.g., components/Button.js):");
    if (!fileName) return;
    const newName = fileName.startsWith("/") ? fileName : `/${fileName}`;
    setFiles({ ...files, [newName]: { code: "" } });
    setSelectedFile(newName);
  };

  const addFileToFolder = (folderPath) => {
    const fileName = prompt("Enter file name (e.g., Button.js):");
    if (!fileName) return;
    const newName = `${folderPath}/${fileName}`;
    setFiles({ ...files, [newName]: { code: "" } });
    setSelectedFile(newName);
  };

  const addFolder = () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;
    const folderPath = folderName.startsWith("/") ? folderName : `/${folderName}`;
    const placeholderFile = `${folderPath}/.gitkeep`;
    setFiles({ ...files, [placeholderFile]: { code: "" } });
    setExpandedFolders(prev => new Set([...prev, folderPath]));
  };

  const deleteFile = (file) => {
    if (Object.keys(files).length <= 1) return alert("Cannot delete last file!");
    const newFiles = { ...files };
    delete newFiles[file];
    setFiles(newFiles);
    setSelectedFile(Object.keys(newFiles)[0]);
  };

  const deleteFolder = (folderPath) => {
    const newFiles = { ...files };
    Object.keys(newFiles).forEach(filePath => {
      if (filePath.startsWith(folderPath + "/")) {
        delete newFiles[filePath];
      }
    });
    setFiles(newFiles);
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      newSet.delete(folderPath);
      return newSet;
    });
    if (selectedFile.startsWith(folderPath + "/")) {
      setSelectedFile(Object.keys(newFiles)[0]);
    }
  };

  const toggleFolder = (folderPath) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderPath)) {
        newSet.delete(folderPath);
      } else {
        newSet.add(folderPath);
      }
      return newSet;
    });
  };

  const getFileIcon = (fileName) => {
    const ext = fileName.split('.').pop();
    switch (ext) {
      case 'js': case 'jsx': return '📄';
      case 'css': return '🎨';
      case 'json': return '⚙️';
      case 'md': return '📝';
      default: return '📄';
    }
  };

  const buildFileTree = () => {
    const tree = {};
    Object.keys(files).forEach(filePath => {
      const parts = filePath.split('/').filter(Boolean);
      let current = tree;

      parts.forEach((part, index) => {
        if (index === parts.length - 1) {
          current[part] = { type: 'file', path: filePath };
        } else {
          if (!current[part]) {
            current[part] = { type: 'folder', children: {}, path: `/${parts.slice(0, index + 1).join('/')}` };
          }
          current = current[part].children;
        }
      });
    });
    return tree;
  };

  const renderFileTree = (tree, depth = 0) => {
    return Object.entries(tree).map(([name, node]) => {
      if (node.type === 'file' && name === '.gitkeep') return null;

      const indent = depth * 16;

      if (node.type === 'folder') {
        const isExpanded = expandedFolders.has(node.path);

        return (
          <div key={name}>
            <div
              className={`group flex items-center justify-between px-2 py-1 text-sm cursor-pointer rounded-sm hover:${isDark ? "bg-gray-800" : "bg-gray-100"}`}
              style={{ paddingLeft: `${8 + indent}px` }}
            >
              <div className="flex items-center" onClick={() => toggleFolder(node.path)}>
                {isExpanded ? <FaChevronDown size={10} /> : <FaChevronRight size={10} />}
                {isExpanded ? <FaFolderOpen size={12} className="mx-1" /> : <FaFolder size={12} className="mx-1" />}
                <span>{name}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    addFileToFolder(node.path);
                  }}
                  className={`p-1 rounded hover:${isDark ? "bg-green-600" : "bg-green-200"}`}
                  title="Add file to folder"
                >
                  <FaPlus size={8} className="text-green-500" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteFolder(node.path);
                  }}
                  className={`p-1 rounded hover:${isDark ? "bg-red-600" : "bg-red-200"}`}
                  title="Delete folder"
                >
                  <FaTrash size={8} className="text-red-500" />
                </button>
              </div>
            </div>
            {isExpanded && renderFileTree(node.children, depth + 1)}
          </div>
        );
      }

      return (
        <div
          key={node.path}
          className={`group flex items-center justify-between px-2 py-1 text-sm cursor-pointer rounded-sm ${selectedFile === node.path
              ? isDark ? "bg-gray-700 text-white" : "bg-blue-100 text-blue-900"
              : isDark ? "hover:bg-gray-800 text-gray-300" : "hover:bg-gray-100 text-gray-700"
            }`}
          style={{ paddingLeft: `${8 + indent}px` }}
        >
          <div className="flex items-center gap-2" onClick={() => setSelectedFile(node.path)}>
            <span>{getFileIcon(name)}</span>
            <span className="truncate">{name}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deleteFile(node.path);
            }}
            className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:${isDark ? "bg-red-600" : "bg-red-200"}`}
          >
            <FaTrash size={10} className="text-red-500" />
          </button>
        </div>
      );
    });
  };

  return (
    <div className={`flex flex-col h-screen ${isDark ? "dark" : ""}`}>
      <Navbar isDark={isDark} toggleTheme={toggleTheme} user={user} setUser={setUser} />

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`flex flex-col border-r ${isDark ? "bg-gray-900 border-gray-700 text-gray-300" : "bg-gray-50 border-gray-200 text-gray-700"}`}
          style={{ width: `${sidebarWidth}px` }}
        >
          <div className={`px-3 py-2 text-xs font-semibold uppercase tracking-wide border-b ${isDark ? "border-gray-700 text-gray-400" : "border-gray-200 text-gray-500"}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button onClick={() => setExplorerCollapsed(!explorerCollapsed)}>
                  {explorerCollapsed ? <FaChevronRight size={10} /> : <FaChevronDown size={10} />}
                </button>
                Explorer
              </div>
              <div className="flex gap-1">
                <button
                  onClick={addFile}
                  className={`p-1 rounded hover:${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                  title="New File"
                >
                  <FaPlus size={10} />
                </button>
                <button
                  onClick={addFolder}
                  className={`p-1 rounded hover:${isDark ? "bg-gray-700" : "bg-gray-200"}`}
                  title="New Folder"
                >
                  <FaFolder size={10} />
                </button>
              </div>
            </div>
          </div>

          {!explorerCollapsed && (
            <div className="flex-1 overflow-y-auto">
              {user && userProjects.length > 0 && (
                <div className="px-3 py-2 border-b border-gray-600">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">My Projects</h3>
                  {userProjects.map(project => (
                    <div
                      key={project._id}
                      onClick={() => loadProject(project._id)}
                      className={`px-2 py-1 text-sm cursor-pointer rounded-sm hover:${isDark ? "bg-gray-800" : "bg-gray-100"} text-blue-400`}
                    >
                      {project.name}
                    </div>
                  ))}
                </div>
              )}
              
              <div className="mt-2">
                {renderFileTree(buildFileTree())}
              </div>

              <div className="px-3 mt-5">
                <button
                  onClick={saveProject}
                  className={`w-full py-2 px-3 text-xs rounded ${isDark ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                >
                  Save Project
                </button>
              </div>
            </div>
          )}
        </div>

        <div
          className={`w-1 cursor-col-resize ${isDark ? "bg-gray-700 hover:bg-blue-500" : "bg-gray-300 hover:bg-blue-400"}`}
          onMouseDown={handleMouseDown}
        />

        {/* Code Editor + Preview */}
        <div className="flex-1 h-full">
          <Sandpack
            template="react"
            files={files}
            theme={isDark ? "dark" : "light"}
            options={{
              showNavigator: true,
              showTabs: true,
              showLineNumbers: true,
              autorun: true,
              externalResources: [],
              activeFile: selectedFile,
              recompileMode: "delayed",
              layout: "preview",
              editorHeight: "100vh",
            }}
            style={{
              height: "calc(100vh - 100px)",
              width: "100%"
            }}
          />
        </div>
      </div>

      <Footer isDark={isDark} />
    </div>
  );
}


