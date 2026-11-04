import { z } from "zod";

const jam = (pesan: string) =>
  z
    .string()
    .min(1, pesan)
    .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Format jam tidak valid");

const teksOpsional = (maks: number) =>
  z.string().trim().max(maks, `Maksimal ${maks} karakter`);

export const agendaSchema = z
  .object({
    // 5 kolom wajib (FR-02)
    perihal: z
      .string()
      .trim()
      .min(3, "Perihal minimal 3 karakter")
      .max(200, "Perihal maksimal 200 karakter"),
    tanggal: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal wajib diisi"),
    jamMulai: jam("Jam mulai wajib diisi"),
    jamSelesai: jam("Jam selesai wajib diisi"),
    lokasi: z
      .string()
      .trim()
      .min(2, "Tempat wajib diisi")
      .max(200, "Tempat maksimal 200 karakter"),

    // Kolom opsional
    pengirim: teksOpsional(200),
    nomorSurat: teksOpsional(150),
    pakaian: teksOpsional(100),
    pendamping: teksOpsional(200),
    catatan: teksOpsional(1000),
    linkMaps: z
      .string()
      .trim()
      .max(500, "Maksimal 500 karakter")
      .refine(
        (v) => v === "" || /^https?:\/\/\S+$/i.test(v),
        "Link harus diawali http:// atau https://",
      ),
    isSensitive: z.boolean(),
  })
  .refine((d) => d.jamSelesai > d.jamMulai, {
    message: "Jam selesai harus lebih besar dari jam mulai",
    path: ["jamSelesai"],
  });

export type AgendaInput = z.infer<typeof agendaSchema>;
