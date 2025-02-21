import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { saveAs } from "file-saver";

const categories = [
  "Logement",
  "Nourriture",
  "Transports",
  "Loisirs",
  "Santé",
  "Épargne",
  "Autres",
];

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#AF19FF",
  "#FF1919",
  "#19FFAF",
];

const BudgetTracker = () => {
  const [transactions, setTransactions] = useState([]);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(categories[0]);
  const [isIncome, setIsIncome] = useState(false);
  const [activeTab, setActiveTab] = useState("transactions");
  const [goals, setGoals] = useState([]);
  const [goalInput, setGoalInput] = useState("");
  const [goalAmount, setGoalAmount] = useState("");
  const [goalDeadline, setGoalDeadline] = useState("");
  const [tasks, setTasks] = useState([]);
  const [taskInput, setTaskInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [budgets, setBudgets] = useState({});
  const [filter, setFilter] = useState({ category: "", type: "", period: "" });
  const [searchQuery, setSearchQuery] = useState("");

  // Charger les données depuis le localStorage
  useEffect(() => {
    const savedData = JSON.parse(localStorage.getItem("transactions")) || [];
    const savedGoals = JSON.parse(localStorage.getItem("goals")) || [];
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    const savedBudgets = JSON.parse(localStorage.getItem("budgets")) || {};
    setTransactions(savedData);
    setGoals(savedGoals);
    setTasks(savedTasks);
    setBudgets(savedBudgets);
  }, []);

  // Sauvegarder les données dans le localStorage
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
    localStorage.setItem("goals", JSON.stringify(goals));
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("budgets", JSON.stringify(budgets));
  }, [transactions, goals, tasks, budgets]);

  // Ajouter une transaction
  const handleAddTransaction = () => {
    if (description.trim() && parseFloat(amount) > 0) {
      const transaction = {
        description,
        amount: parseFloat(amount),
        category,
        type: isIncome ? "income" : "expense",
        date: new Date().toLocaleDateString("fr-FR"),
      };
      setTransactions([...transactions, transaction]);
      setDescription("");
      setAmount("");
    }
  };

  // Ajouter un objectif
  const handleAddGoal = () => {
    if (goalInput.trim() && goalAmount && goalDeadline) {
      setGoals([
        ...goals,
        {
          text: goalInput,
          amount: parseFloat(goalAmount),
          deadline: goalDeadline,
          progress: 0,
        },
      ]);
      setGoalInput("");
      setGoalAmount("");
      setGoalDeadline("");
    }
  };

  // Ajouter une tâche
  const handleAddTask = () => {
    if (taskInput.trim()) {
      setTasks([...tasks, { text: taskInput, completed: false }]);
      setTaskInput("");
    }
  };

  // Marquer une tâche comme terminée
  const handleToggleTask = (index) => {
    const updatedTasks = tasks.map((task, i) =>
      i === index ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
  };

  // Supprimer une tâche
  const handleDeleteTask = (index) => {
    const updatedTasks = tasks.filter((_, i) => i !== index);
    setTasks(updatedTasks);
  };

  // Exporter les transactions en CSV
  const exportToCSV = () => {
    const headers = ["Description", "Montant", "Catégorie", "Type", "Date"];
    const csvContent = [
      headers.join(","),
      ...transactions.map((t) => Object.values(t).join(",")),
    ].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "transactions.csv");
  };

  // Filtrer les transactions
  const filteredTransactions = transactions.filter((t) => {
    return (
      (filter.category ? t.category === filter.category : true) &&
      (filter.type ? t.type === filter.type : true) &&
      (filter.period ? t.date.includes(filter.period) : true) &&
      (searchQuery
        ? t.description.toLowerCase().includes(searchQuery.toLowerCase())
        : true)
    );
  });

  // Données pour les graphiques
  const barData = categories.map((cat) => ({
    name: cat,
    value: transactions
      .filter((t) => t.category === cat && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0),
  }));

  const pieData = categories.map((cat) => ({
    name: cat,
    value: transactions
      .filter((t) => t.category === cat && t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0),
  }));

  return (
    <div
      style={{
        padding: "20px",
        maxWidth: "900px",
        margin: "0 auto",
        backgroundColor: darkMode ? "#333" : "#f7f8fa",
        color: darkMode ? "#fff" : "#000",
        borderRadius: "12px",
      }}
    >
      <h1 style={{ textAlign: "center", color: darkMode ? "#fff" : "#4A4A4A" }}>
        💰 Gestionnaire Financier
      </h1>
      <button
        onClick={() => setDarkMode(!darkMode)}
        style={{ marginBottom: "20px" }}
      >
        {darkMode ? "Mode Clair" : "Mode Sombre"}
      </button>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-around",
          marginBottom: "20px",
        }}
      >
        <button
          onClick={() => setActiveTab("transactions")}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Statistiques
        </button>
        <button
          onClick={() => setActiveTab("goals")}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Objectifs
        </button>
        <button
          onClick={() => setActiveTab("tasks")}
          style={{ padding: "10px", cursor: "pointer" }}
        >
          Tâches
        </button>
      </nav>

      {activeTab === "transactions" && (
        <div>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
          />
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Montant (€)"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <label>
            <input
              type="checkbox"
              checked={isIncome}
              onChange={() => setIsIncome(!isIncome)}
            />{" "}
            Revenu ?
          </label>
          <button onClick={handleAddTransaction}>Ajouter Transaction</button>

          <h3>Filtrer les Transactions</h3>
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
          />
          <select
            value={filter.category}
            onChange={(e) => setFilter({ ...filter, category: e.target.value })}
          >
            <option value="">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter({ ...filter, type: e.target.value })}
          >
            <option value="">Tous les types</option>
            <option value="income">Revenu</option>
            <option value="expense">Dépense</option>
          </select>
          <input
            type="month"
            value={filter.period}
            onChange={(e) => setFilter({ ...filter, period: e.target.value })}
          />

          <ul>
            {filteredTransactions.map((t, index) => (
              <li key={index}>
                {t.description} - {t.amount}€ ({t.category}, {t.type}, {t.date})
              </li>
            ))}
          </ul>
          <button onClick={exportToCSV}>Exporter en CSV</button>
        </div>
      )}

      {activeTab === "stats" && (
        <div>
          <h3>Dépenses par Catégorie</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>

          <h3>Répartition des Dépenses</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {activeTab === "goals" && (
        <div>
          <input
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Objectif"
          />
          <input
            type="number"
            value={goalAmount}
            onChange={(e) => setGoalAmount(e.target.value)}
            placeholder="Montant (€)"
          />
          <input
            type="date"
            value={goalDeadline}
            onChange={(e) => setGoalDeadline(e.target.value)}
          />
          <button onClick={handleAddGoal}>Ajouter Objectif</button>
          <ul>
            {goals.map((goal, index) => (
              <li key={index}>
                {goal.text} - {goal.amount}€ (Date limite: {goal.deadline})
              </li>
            ))}
          </ul>
        </div>
      )}

      {activeTab === "tasks" && (
        <div>
          <input
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            placeholder="Nouvelle tâche"
          />
          <button onClick={handleAddTask}>Ajouter Tâche</button>
          <ul>
            {tasks.map((task, index) => (
              <li
                key={index}
                style={{
                  textDecoration: task.completed ? "line-through" : "none",
                }}
              >
                {task.text}
                <button onClick={() => handleToggleTask(index)}>
                  {task.completed ? "Annuler" : "Terminer"}
                </button>
                <button onClick={() => handleDeleteTask(index)}>
                  Supprimer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
