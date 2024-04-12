

import { GoogleGenerativeAI } from "@google/generative-ai";
import Itinerary from '../models/Itinerary.js';
import axios from 'axios';

// Replace 'YOUR_API_KEY' with your actual API key
const apiKey = 'AIzaSyACbSW3wxtAxrQOpNY4CtZfgAkCEiMtOSQ';

// Initialize GoogleGenerativeAI with your API key
const genAI = new GoogleGenerativeAI(apiKey);

// Route to generate itinerary
export const generateItinerary = async (req, res) => {
  const { source, destination, startDate, endDate, durationInDays } = req.body;

  try {
    const itineraryText = await generateItineraryText(source, destination, startDate, endDate, durationInDays);

    res.json({ itineraryText });
  } catch (error) {
    console.error('Error generating itinerary:', error);
    res.status(500).json({ message: 'Error generating itinerary' });
  }
};

// Route to create a new itinerary
export const createItinerary = async (req, res) => {
  const { source, destination, startDate, endDate, durationInDays, itineraryText } = req.body;

  try {
    const itinerary = new Itinerary({
      source,
      destination,
      startDate,
      endDate,
      durationInDays,
      itineraryText
    });

    await itinerary.save();

    res.status(201).json(itinerary);
  } catch (error) {
    console.error('Error creating itinerary:', error);
    res.status(500).json({ message: 'Error creating itinerary' });
  }
};

// Route to update an existing itinerary
export const updateItinerary = async (req, res) => {
  const { id } = req.params;
  const { itineraryText } = req.body;

  try {
    const updatedItinerary = await Itinerary.findByIdAndUpdate(id, { itineraryText }, { new: true });

    if (!updatedItinerary) {
      return res.status(404).json({ message: 'Itinerary not found' });
    }

    res.json(updatedItinerary);
  } catch (error) {
    console.error('Error updating itinerary:', error);
    res.status(500).json({ message: 'Error updating itinerary' });
  }
};

// Function to generate itinerary text
async function generateItineraryText(source, destination, startDate, endDate, durationInDays) {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Generate a personalized trip itinerary for a ${durationInDays}-day trip from ${source} to ${destination} starting on ${startDate} and ending on ${endDate}, with an optimum budget (Currency: INR).`;

  const result = await model.generateContent(prompt);
  const response = await result.response;

  return formatItinerary(response.text(), startDate, endDate, durationInDays);
}

// Function to format the generated itinerary text
function formatItinerary(generatedText, startDate, endDate, durationInDays) {
  let formattedText = "Planned Itinerary\n\n";

  let currentDate = new Date(startDate);

  // Generate itinerary for each day
  for (let day = 1; day <= durationInDays; day++) {
    formattedText += `**Day ${day} (${currentDate.toDateString()}):**\n\n`;

    // Generate day's itinerary
    const dayItinerary = generateDayItinerary(generatedText, currentDate);
    formattedText += dayItinerary;

    // Move to the next day
    currentDate.setDate(currentDate.getDate() + 1);
    formattedText += "\n";
  }

  // Add summary section at the end
  formattedText += generateSummary();
  return formattedText;
}

// Function to generate itinerary for a single day
function generateDayItinerary(generatedText, currentDate) {
  let dayText = generatedText.replace(/Day \d+/, "");
  dayText = dayText.replace(/Morning/g, "\n*Morning:*")
                   .replace(/Afternoon/g, "\n*Afternoon:*")
                   .replace(/Evening/g, "\n*Evening:*");

  return dayText;
}

// Function to generate the summary section of the itinerary
function generateSummary() {
  return `\n**Summary:**\n\n*Accommodation:*\n\n*Transportation:*\n\n*Food:*\n\n*Attractions:*\n\n*Estimated Budget:*`;
}

export default generateItinerary;
