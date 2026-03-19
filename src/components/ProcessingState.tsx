"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, Circle, Zap, Brain } from "lucide-react";
import {
  AgentTask,
  createAgentTasks,
  simulateAgentExecution,
} from "@/lib/agents";
import type { TravelInput } from "@/components/InputEngine";
import { useTripStore } from "@/store/useTripStore";

interface Props {
  destination: string;
  onComplete: () => void;
  userInput?: TravelInput | null;
}

export default function ProcessingState({ destination, onComplete, userInput }: Props) {
  const initialTasks = useMemo(
    () => createAgentTasks(destination),
    [destination]
  );
  const [tasks, setTasks] = useState<AgentTask[]>(initialTasks);
  const [aiInsight, setAiInsight] = useState<string>("");
  const aiCallMade = useRef(false);

  // Overall progress derived from individual agents
  const overallProgress = useMemo(() => {
    if (tasks.length === 0) return 0;
    return Math.round(
      tasks.reduce((sum, t) => sum + t.progress, 0) / tasks.length
    );
  }, [tasks]);

  // Fire real AI agent intelligence call in the background
  useEffect(() => {
    if (!userInput || aiCallMade.current) return;
    aiCallMade.current = true;

    const fetchAgentIntel = async () => {
      try {
        const aiPlan = useTripStore.getState().aiRoutePlan;
        const cities = aiPlan?.cities?.map(c => ({ city: c.city, days: c.days }));

        const response = await fetch("/api/agent-intel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            origin: userInput.origin,
            destination: userInput.destination,
            duration: userInput.duration,
            budget: userInput.budget,
            adults: userInput.adults,
            children: userInput.children,
            foodPreference: userInput.foodPreference,
            tripType: userInput.tripType,
            startDate: userInput.startDate,
            cities,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          // Store agent intelligence in the trip store for use in downstream components
          useTripStore.getState().setAgentIntelligence(data.intelligence);
          setAiInsight(`${data.agentCount} AI agents contributed real intelligence`);
          console.log("[ProcessingState] Real AI agent intelligence loaded:", data.agentCount, "agents");
        }
      } catch (err) {
        console.error("[ProcessingState] Agent intel background call failed:", err);
      }
    };

    fetchAgentIntel();
  }, [userInput]);

  useEffect(() => {
    const cancel = simulateAgentExecution(
      initialTasks,
      (updated) => setTasks([...updated]),
      onComplete
    );
    return cancel;
  }, [initialTasks, onComplete]);

  return (
    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6 }}
        className="flex w-full max-w-2xl flex-col items-center"
      >
        {/* Animated orb */}
        <div className="relative mb-10">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 rounded-full bg-primary-200 blur-3xl"
            style={{ width: 120, height: 120, margin: "-20px" }}
          />
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 180, 360],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="flex h-20 w-20 items-center justify-center rounded-full border border-primary-200 bg-primary-50"
          >
            <Brain className="h-8 w-8 animate-pulse text-primary-600" />
          </motion.div>
        </div>

        {/* Title */}
        <h2 className="mb-1 text-2xl font-bold text-text-primary">
          7 AI Agents analyzing your{" "}
          <span className="bg-linear-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
            {destination}
          </span>{" "}
          trip
        </h2>
        <p className="mb-2 text-sm text-text-muted">
          Real Gemini AI agents researching flights, hotels, dining & more
        </p>
        {aiInsight && (
          <motion.p
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
          >
            <Zap className="h-3 w-3" /> {aiInsight}
          </motion.p>
        )}
        {!aiInsight && <div className="mb-6" />}

        {/* Agent Cards */}
        <div className="mb-8 w-full space-y-3">
          {tasks.map((task, index) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: index * 0.06 }}
              className={`overflow-hidden rounded-2xl border transition-all ${
                task.status === "running"
                  ? "border-primary-300 bg-primary-50 shadow-lg shadow-primary-500/5"
                  : task.status === "done"
                  ? "border-emerald-200 bg-emerald-50/50"
                  : "border-gray-200 bg-gray-50"
              }`}
            >
              <div className="flex items-start gap-3 px-4 py-3">
                {/* Status Icon */}
                <div className="mt-0.5 shrink-0 text-xl">
                  {task.status === "done" ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400 }}
                    >
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </motion.div>
                  ) : task.status === "running" ? (
                    <motion.div
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                    >
                      <Zap className="h-5 w-5 text-primary-600" />
                    </motion.div>
                  ) : (
                    <Circle className="h-5 w-5 text-gray-300" />
                  )}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{task.icon}</span>
                    <span
                      className={`text-sm font-semibold ${
                        task.status === "done"
                          ? "text-text-secondary"
                          : task.status === "running"
                          ? "text-text-primary"
                          : "text-text-muted"
                      }`}
                    >
                      {task.agentName}
                    </span>
                    <span
                      className={`text-[10px] ${
                        task.status === "running"
                          ? "text-text-muted"
                          : "text-gray-300"
                      }`}
                    >
                      {task.agentRole}
                    </span>
                  </div>

                  {/* Current Step Text */}
                  <AnimatePresence mode="wait">
                    {task.status === "running" && (
                      <motion.p
                        key={task.currentStepIndex}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.25 }}
                        className="mt-1 text-xs text-primary-600"
                      >
                        {task.steps[task.currentStepIndex]}
                      </motion.p>
                    )}
                    {task.status === "done" && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mt-1 text-xs text-emerald-600"
                      >
                        {task.result}
                      </motion.p>
                    )}
                  </AnimatePresence>

                  {/* Source badges */}
                  {task.status !== "pending" && task.sources && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-1.5 flex flex-wrap gap-1"
                    >
                      {task.sources.map((src) => (
                        <span
                          key={src}
                          className="rounded bg-gray-100 px-1.5 py-0.5 text-[9px] text-text-muted"
                        >
                          {src}
                        </span>
                      ))}
                    </motion.div>
                  )}

                  {/* Agent Progress Bar */}
                  {task.status === "running" && (
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-gray-200">
                      <motion.div
                        className="h-full rounded-full bg-linear-to-r from-primary-500 to-primary-600"
                        animate={{ width: `${task.progress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Overall Progress bar */}
        <div className="w-full">
          <div className="mb-2 flex justify-between text-xs text-text-muted">
            <span>Overall Progress</span>
            <span>{overallProgress}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
            <motion.div
              className="h-full rounded-full bg-linear-to-r from-primary-500 via-primary-600 to-primary-500"
              animate={{ width: `${overallProgress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
