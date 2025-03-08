"use client";

import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardFooter } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import {
  Send,
  RefreshCw,
  Settings,
  Moon,
  Sun,
  Trash2,
  Edit2,
  ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ChatApp() {
  // Load saved personas from localStorage or use defaults
  const getInitialPersonas = () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("chatPersonas");
      if (saved) {
        return JSON.parse(saved);
      }
    }

    return [
      {
        id: "persona1",
        name: "Alex",
        avatar: "/placeholder.svg?height=40&width=40&text=A",
        color: "bg-indigo-500",
        bgColor: "bg-indigo-50",
        textColor: "text-indigo-800",
        gradient: "from-indigo-500 to-purple-500",
      },
      {
        id: "persona2",
        name: "Taylor",
        avatar: "/placeholder.svg?height=40&width=40&text=T",
        color: "bg-rose-500",
        bgColor: "bg-rose-50",
        textColor: "text-rose-800",
        gradient: "from-rose-500 to-pink-500",
      },
    ];
  };

  // State for messages, current persona, and input
  const [personas, setPersonas] = useState(getInitialPersonas);
  const [messages, setMessages] = useState([]);
  const [activePersona, setActivePersona] = useState(personas[0].id);
  const [inputText, setInputText] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [editingPersona, setEditingPersona] = useState(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Refs for scrolling to bottom of messages and focusing input
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null); // New ref for the input field

  // Save personas to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("chatPersonas", JSON.stringify(personas));
    }
  }, [personas]);

  // Load saved messages from localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedMessages = localStorage.getItem("chatMessages");
      if (savedMessages) {
        try {
          const parsedMessages = JSON.parse(savedMessages);
          // Convert string timestamps back to Date objects
          const messagesWithDateObjects = parsedMessages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }));
          setMessages(messagesWithDateObjects);
        } catch (e) {
          console.error("Error loading saved messages:", e);
        }
      }
    }
  }, []);

  // Save messages to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined" && messages.length > 0) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages]);

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Add keyboard shortcut for switching personas
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Alt+S or Ctrl+S to switch personas
      if ((e.altKey || e.ctrlKey) && e.key === "s") {
        e.preventDefault(); // Prevent saving the page
        switchPersona();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePersona]); // Re-add the event listener when activePersona changes

  // Handle sending a new message
  const handleSendMessage = () => {
    if (inputText.trim() === "") return;

    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      personaId: activePersona,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputText("");
  };

  // Get persona details by ID
  const getPersonaById = (id) => {
    return personas.find((p) => p.id === id) || personas[0];
  };

  // Switch to the other persona with animation
  const switchPersona = () => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActivePersona(
        activePersona === personas[0].id ? personas[1].id : personas[0].id
      );
      setIsTransitioning(false);

      // Focus the input field after switching personas
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50); // Small delay to ensure the UI has updated
    }, 150);
  };

  // Clear all messages
  const clearMessages = () => {
    setMessages([]);
    localStorage.removeItem("chatMessages");
    setSettingsOpen(false);
  };

  // Start editing a persona
  const startEditPersona = (persona) => {
    setEditingPersona(persona);
    setEditName(persona.name);
    setEditAvatar(persona.avatar);
    setSettingsOpen(false);
    setEditDialogOpen(true);
  };

  // Save edited persona
  const savePersona = () => {
    if (!editingPersona) return;

    const updatedPersonas = personas.map((p) =>
      p.id === editingPersona.id
        ? { ...p, name: editName, avatar: editAvatar }
        : p
    );

    setPersonas(updatedPersonas);
    setEditingPersona(null);
    setEditDialogOpen(false);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingPersona(null);
    setEditDialogOpen(false);
  };

  // Handle image upload
  const handleImageUpload = (file) => {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.match("image.*")) {
        reject(new Error("Please select an image file"));
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target.result;
        resolve(dataUrl);
      };
      reader.onerror = () => {
        reject(new Error("Failed to read the image"));
      };
      reader.readAsDataURL(file);
    });
  };

  // Generate a random avatar
  const generateRandomAvatar = () => {
    const styles = [
      "adventurer",
      "adventurer-neutral",
      "avataaars",
      "big-ears",
      "big-smile",
      "bottts",
      "croodles",
      "fun-emoji",
      "icons",
      "identicon",
      "initials",
      "lorelei",
      "micah",
      "miniavs",
      "open-peeps",
      "personas",
      "pixel-art",
    ];
    const style = styles[Math.floor(Math.random() * styles.length)];
    const seed = Math.random().toString(36).substring(2, 8);
    return `https://api.dicebear.com/7.x/${style}/svg?seed=${seed}`;
  };

  const currentPersona = getPersonaById(activePersona);
  const otherPersona = getPersonaById(
    activePersona === personas[0].id ? personas[1].id : personas[0].id
  );

  // Format date for message groups
  const formatMessageDate = (date) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
      });
    }
  };

  // Group messages by date
  const groupMessagesByDate = () => {
    const groups = {};

    messages.forEach((message) => {
      const date = new Date(message.timestamp);
      const dateString = date.toDateString();

      if (!groups[dateString]) {
        groups[dateString] = {
          date: date,
          messages: [],
        };
      }

      groups[dateString].messages.push(message);
    });

    return Object.values(groups).sort((a, b) => a.date - b.date);
  };

  const messageGroups = groupMessagesByDate();

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300`}
    >
      <Card className="w-full h-full max-w-md mx-auto shadow-xl overflow-hidden flex flex-col rounded-xl dark:bg-gray-800 dark:border-gray-700">
        {/* Header with gradient background */}
        <div
          className={`p-4 flex items-center justify-between bg-gradient-to-r ${currentPersona.gradient} text-white`}
        >
          <div className="flex items-center">
            <span className="font-medium text-lg">Dual Chat</span>
            <div className="ml-2 text-xs bg-white/20 px-2 py-1 rounded-full">
              Press Alt+S to switch
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Dark mode toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Settings button */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20 rounded-full"
              onClick={() => setSettingsOpen(true)}
            >
              <Settings className="h-5 w-5" />
            </Button>

            {/* Active persona indicator */}
            <div className="flex items-center bg-white/20 rounded-full px-2 py-1">
              <Avatar className="h-6 w-6 mr-1">
                <AvatarImage
                  src={currentPersona.avatar}
                  alt={currentPersona.name}
                />
                <AvatarFallback className={currentPersona.color}>
                  {currentPersona.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs font-medium">{currentPersona.name}</span>
            </div>
          </div>
        </div>

        {/* Chat messages */}
        <CardContent className="flex-1 p-0 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <AnimatePresence>
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-muted-foreground p-4"
              >
                <div className="text-center">
                  <div className="flex space-x-4 mb-4 justify-center">
                    <motion.div
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Avatar className="h-16 w-16 mb-2 ring-2 ring-white dark:ring-gray-700 shadow-lg">
                        <AvatarImage
                          src={personas[0].avatar}
                          alt={personas[0].name}
                        />
                        <AvatarFallback className={personas[0].color}>
                          {personas[0].name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {personas[0].name}
                      </span>
                    </motion.div>
                    <motion.div
                      className="flex flex-col items-center"
                      whileHover={{ scale: 1.05 }}
                    >
                      <Avatar className="h-16 w-16 mb-2 ring-2 ring-white dark:ring-gray-700 shadow-lg">
                        <AvatarImage
                          src={personas[1].avatar}
                          alt={personas[1].name}
                        />
                        <AvatarFallback className={personas[1].color}>
                          {personas[1].name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">
                        {personas[1].name}
                      </span>
                    </motion.div>
                  </div>
                  <p className="font-medium dark:text-gray-200">
                    Start a conversation!
                  </p>
                  <p className="text-sm mt-1 text-gray-500 dark:text-gray-400">
                    Tap the switch button or press Alt+S to change personas
                  </p>

                  <motion.div
                    className="mt-8 bg-white dark:bg-gray-700 p-4 rounded-lg shadow-md max-w-xs mx-auto"
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300">
                      💡 <strong>Tip:</strong> You can customize both profiles
                      in the settings
                    </p>
                  </motion.div>
                </div>
              </motion.div>
            ) : (
              <div className="py-4 px-3">
                {messageGroups.map((group, groupIndex) => (
                  <div key={group.date.toISOString()} className="mb-6">
                    <div className="flex justify-center mb-4">
                      <div className="bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded-full text-xs font-medium text-gray-600 dark:text-gray-300">
                        {formatMessageDate(group.date)}
                      </div>
                    </div>

                    <div className="space-y-3">
                      {group.messages.map((message, messageIndex) => {
                        const persona = getPersonaById(message.personaId);
                        // Always position persona1 on right, persona2 on left
                        const isPersona1 = message.personaId === personas[0].id;

                        // Check if this is a consecutive message from the same persona
                        const isConsecutive =
                          messageIndex > 0 &&
                          group.messages[messageIndex - 1].personaId ===
                            message.personaId;

                        return (
                          <motion.div
                            key={message.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex ${
                              isPersona1 ? "justify-end" : "justify-start"
                            }`}
                          >
                            <div
                              className={`flex items-end gap-2 max-w-[80%] ${
                                isPersona1 ? "flex-row-reverse" : ""
                              }`}
                            >
                              {!isConsecutive && (
                                <Avatar className="h-8 w-8 mb-1 flex-shrink-0">
                                  <AvatarImage
                                    src={persona.avatar}
                                    alt={persona.name}
                                  />
                                  <AvatarFallback className={persona.color}>
                                    {persona.name.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                              )}
                              <div
                                className={`flex flex-col ${
                                  isConsecutive
                                    ? isPersona1
                                      ? "mr-8"
                                      : "ml-8"
                                    : ""
                                }`}
                              >
                                <div
                                  className={`p-3 ${
                                    isPersona1
                                      ? "rounded-t-2xl rounded-bl-2xl"
                                      : "rounded-t-2xl rounded-br-2xl"
                                  } 
                                    ${
                                      isConsecutive
                                        ? isPersona1
                                          ? "rounded-tr-md"
                                          : "rounded-tl-md"
                                        : ""
                                    } 
                                    shadow-sm ${persona.bgColor} ${
                                    persona.textColor
                                  } dark:opacity-90`}
                                >
                                  {message.text}
                                </div>
                                <span
                                  className={`text-xs text-gray-500 dark:text-gray-400 mt-1 ${
                                    isPersona1 ? "text-right" : "text-left"
                                  }`}
                                >
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </AnimatePresence>
        </CardContent>

        {/* Quick persona switcher */}
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <motion.div
            className="flex items-center justify-between"
            whileHover={{ scale: 1.01 }}
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium dark:text-gray-300">
                Chatting as:
              </span>
              <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-1">
                <Avatar className="h-5 w-5 mr-1">
                  <AvatarImage
                    src={currentPersona.avatar}
                    alt={currentPersona.name}
                  />
                  <AvatarFallback className={currentPersona.color}>
                    {currentPersona.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-bold dark:text-gray-200">
                  {currentPersona.name}
                </span>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2 rounded-full border-dashed hover:border-solid dark:border-gray-600 dark:text-gray-300"
              onClick={switchPersona}
              disabled={isTransitioning}
            >
              <RefreshCw className="h-3 w-3" />
              <span>Switch to {otherPersona.name}</span>
            </Button>
          </motion.div>
        </div>

        {/* Message input */}
        <CardFooter className="p-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex w-full items-center space-x-2">
            <Avatar className="h-8 w-8 flex-shrink-0 ring-2 ring-white dark:ring-gray-700">
              <AvatarImage
                src={currentPersona.avatar}
                alt={currentPersona.name}
              />
              <AvatarFallback className={currentPersona.color}>
                {currentPersona.name.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <Input
              ref={inputRef} // Add the ref to the input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message as ${currentPersona.name}...`}
              className="flex-1 rounded-full dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button
              size="icon"
              className={`rounded-full bg-gradient-to-r ${currentPersona.gradient} hover:opacity-90`}
              onClick={handleSendMessage}
              disabled={inputText.trim() === ""}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Settings Dialog */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Settings</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="profiles" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profiles">Profiles</TabsTrigger>
              <TabsTrigger value="chat">Chat</TabsTrigger>
            </TabsList>

            <TabsContent value="profiles" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                {personas.map((persona) => (
                  <div
                    key={persona.id}
                    className="border rounded-lg p-3 flex flex-col items-center"
                  >
                    <Avatar className="h-16 w-16 mb-2">
                      <AvatarImage src={persona.avatar} alt={persona.name} />
                      <AvatarFallback className={persona.color}>
                        {persona.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-center">
                      {persona.name}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2 w-full"
                      onClick={() => startEditPersona(persona)}
                    >
                      <Edit2 className="h-3 w-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="chat" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Button
                  variant="destructive"
                  className="w-full"
                  onClick={clearMessages}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Clear Chat History
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Edit Profile Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>

          {editingPersona && (
            <div className="flex flex-col items-center gap-4 py-4">
              <div className="relative group">
                <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                  <AvatarImage src={editAvatar} alt={editName} />
                  <AvatarFallback className={editingPersona.color}>
                    {editName.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <label
                    htmlFor="picture-upload"
                    className="cursor-pointer p-2 rounded-full bg-white/20 hover:bg-white/40 transition-colors"
                  >
                    <ImageIcon className="h-5 w-5 text-white" />
                  </label>
                </div>
              </div>

              <div className="grid w-full gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter name"
                />
              </div>

              <div className="w-full">
                <Label className="block mb-2">Profile Picture</Label>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditAvatar(generateRandomAvatar())}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Random Avatar
                  </Button>

                  <label htmlFor="picture-upload" className="cursor-pointer">
                    <Button variant="outline" size="sm" type="button">
                      <ImageIcon className="h-3 w-3 mr-1" />
                      Upload Image
                    </Button>
                    <input
                      id="picture-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const dataUrl = await handleImageUpload(file);
                            setEditAvatar(dataUrl);
                          } catch (error) {
                            console.error("Error uploading image:", error);
                          }
                        }
                      }}
                    />
                  </label>

                  <label htmlFor="camera-capture" className="cursor-pointer">
                    <Button variant="outline" size="sm" type="button">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-1"
                      >
                        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                        <circle cx="12" cy="13" r="3" />
                      </svg>
                      Take Photo
                    </Button>
                    <input
                      id="camera-capture"
                      type="file"
                      accept="image/*"
                      capture="user"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (file) {
                          try {
                            const dataUrl = await handleImageUpload(file);
                            setEditAvatar(dataUrl);
                          } catch (error) {
                            console.error("Error capturing image:", error);
                          }
                        }
                      }}
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={cancelEditing}>
              Cancel
            </Button>
            <Button onClick={savePersona}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
