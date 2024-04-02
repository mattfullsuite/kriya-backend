
const express = require("express");
require("dotenv").config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
const config = new GoogleGenerativeAI(apiKey);
const modelId = "gemini-pro";
const model = config.getGenerativeModel({ model: modelId });

const handleGenerateRequest = async (req, res) => {
  try {
    const prompt = "Give me a reason to take a work leave for being sick."
    const result = await model.generateContent(prompt);
    //res.json({ response: result });
    res.json(result)
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while generating content.");
  }
};

const handleGenerateSummary = async (req, res) => {
  try {
    const prompt = "Summarize these feedbacks: Marketing Department Manager is not active. I have been trying my best to cope up with all the responsibilites. The workload is too heavy. I'm unmotivated. Morale is low in the whole company. I have a problem with my manager.The marketing department is toxic. Nightshift is toxic. I am doing a lot of things in my time."
    const result = await model.generateContent(prompt);
    //res.json({ response: result });
    res.json(result)
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while generating content.");
  }
};

const handleGenerateVoiceover = async (req, res) => {

}

module.exports = {
  handleGenerateRequest,
  handleGenerateSummary,
  handleGenerateVoiceover,
};