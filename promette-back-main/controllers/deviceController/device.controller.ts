import { Request, Response } from "express";
import { promette } from '../../models/database.models';



export const getAllDevices = async (req: Request, res: Response) => {
  try {
    const count = await promette.ct_dispositivo.count();

    if (count === 0) {
      return res.status(404).json({ msg: "No devices found" });
    }

    const devices = await promette.ct_dispositivo.findAll();

    res.status(200).json({
      msg: "success",
      devices,
    });
  } catch (error) {
    console.error("Error fetching devices:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getDeviceById = async (req: Request, res: Response) => {
  const { id_dispositivo } = req.params;

  if (isNaN(Number(id_dispositivo))) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  try {
    const device = await promette.ct_dispositivo.findByPk(id_dispositivo);

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    res.status(200).json({
      msg: "success",
      device,
    });
  } catch (error) {
    console.error("Error fetching device:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const registerDevice = async (req: Request, res: Response) => {
  const { nombre_dispositivo, descripcion } = req.body;

  if (!nombre_dispositivo) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const device = await promette.ct_dispositivo.create({
      nombre_dispositivo,
      descripcion,
    });

    res.status(201).json({
      msg: "Device created successfully",
      device,
    });
  } catch (error) {
    console.error("Error creating device:", error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateDevice = async (req: Request, res: Response) => {
  const { id_dispositivo } = req.params;
  const { nombre_dispositivo, descripcion } = req.body;

  if (isNaN(Number(id_dispositivo))) {
    return res.status(400).json({ msg: "Invalid ID" });
  }

  try {
    const device = await promette.ct_dispositivo.findByPk(id_dispositivo);

    if (!device) {
      return res.status(404).json({ msg: "Device not found" });
    }

    await device.update({
      nombre_dispositivo,
      descripcion,
    });

    res.status(200).json({
      msg: "Device updated successfully",
      device,
    });
  } catch (error) {
    console.error("Error updating device:", error);
    res.status(500).json({ msg: "Server error" });
  }
};
