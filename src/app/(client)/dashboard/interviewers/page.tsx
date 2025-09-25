"use client";

import { useInterviewers } from "@/contexts/interviewers.context";
import React from "react";
import { ChevronLeft } from "lucide-react";
import { ChevronRight } from "lucide-react";
import InterviewerCard from "@/components/dashboard/interviewer/interviewerCard";
import CreateInterviewerButton from "@/components/dashboard/interviewer/createInterviewerButton";

function Interviewers() {
  // Dummy data for interviewers
  const dummyInterviewers = [
    {
      name: "Alice Johnson",
      techStack: "React, Node.js",
      slot: "10:00 AM - 11:00 AM",
      status: "Available",
    },
    {
      name: "Bob Smith",
      techStack: "Python, Django",
      slot: "11:30 AM - 12:30 PM",
      status: "Busy",
    },
    {
      name: "Carol Lee",
      techStack: "Java, Spring Boot",
      slot: "2:00 PM - 3:00 PM",
      status: "Available",
    },
    {
      name: "David Kim",
      techStack: "Go, Kubernetes",
      slot: "3:30 PM - 4:30 PM",
      status: "Offline",
    },
  ];

  return (
    <main className="p-8 pt-0 ml-12 mr-auto rounded-md">
      <div className="flex flex-col items-left">
        <div className="flex flex-row mt-5 mb-6">
          <div>
            <h2 className="mr-2 text-2xl font-semibold tracking-tight mt-3">
              Interviewers
            </h2>
            <h3 className=" text-sm tracking-tight text-gray-600 font-medium ">
              Get to know them by clicking the profile.
            </h3>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg shadow-md">
            <thead>
              <tr className="bg-indigo-100 text-indigo-800">
                <th className="py-3 px-6 text-left font-semibold">Name</th>
                <th className="py-3 px-6 text-left font-semibold">Tech Stack</th>
                <th className="py-3 px-6 text-left font-semibold">Slot</th>
                <th className="py-3 px-6 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {dummyInterviewers.map((interviewer, idx) => (
                <tr key={idx} className="border-b hover:bg-indigo-50">
                  <td className="py-3 px-6">{interviewer.name}</td>
                  <td className="py-3 px-6">{interviewer.techStack}</td>
                  <td className="py-3 px-6">{interviewer.slot}</td>
                  <td className="py-3 px-6">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      interviewer.status === "Available"
                        ? "bg-green-100 text-green-700"
                        : interviewer.status === "Busy"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                      {interviewer.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default Interviewers;
