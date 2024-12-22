import Listing from "@/libs/models/listing.model";
import { connect } from "@/libs/mongodb/mongoose";

/* eslint-disable */
// * untuk update listing
export const POST = async (req: any) => {
  await connect();
  const data = await req.json();

  try {
    // Ambil nilai startIndex dari data, lalu ubah ke angka pakai parseInt. Jika tidak ada, maka defaultnya 0
    const startIndex = parseInt(data.startIndex) || 0;

    // Buat batasan jumlah data yang diambil (pagination). Jika tidak ada, maka defaultnya 9
    const limit = parseInt(data.limit) || 9;

    // Cek apakah nilai data.order itu "asc" , jika iya maka sortDirection = 1, jika tidak maka sortDirection = -1
    const sortDirection = data.order === "asc" ? 1 : -1;

    let offer = data.offer;
    if (offer === undefined || offer === "false") {
      offer = { $in: [false, true] };
    }

    let furnished = data.furnished;
    if (furnished === undefined || furnished === "false") {
      furnished = { $in: [false, true] };
    }

    let parking = data.parking;
    if (parking === undefined || parking === "false") {
      parking = { $in: [false, true] };
    }

    let type = data.type;
    if (type === undefined || type === "all") {
      type = { $in: ["sale", "rent"] };
    }

    const listings = await Listing.find({
      // Kalau data.userId true, maka tambahkan filter { userId: data.userId } ke query database.
      ...(data.userId && { userId: data.userId }),

      // Kalau data.listingId ada, tambahkan filter untuk mencocokkan ID dokumen (_id).
      ...(data.listingId && { _id: data.listingId }),

      //  Kalau data.searchTerm ada, tambahkan filter pencarian dengan $regex
      ...(data.searchTerm && {
        // * $or: Mencari dalam beberapa field (name dan description).
        $or: [
          // Mencari searchTerm dalam field name tanpa memperhatikan huruf besar/kecil ($options: "i").
          { name: { $regex: data.searchTerm, $options: "i" } },
          // Sama seperti di name, tapi mencari dalam description.
          { description: { $regex: data.searchTerm, $options: "i" } },
          // * $regex: Mencari teks yang cocok secara pola
        ],
      }),
      offer,
      furnished,
      parking,
      type,
    })
      // Mengurutkan data berdasarkan updatedAt (tanggal terakhir data diperbarui).
      .sort({ updatedAt: sortDirection })

      // Melewati sejumlah data dari awal, sesuai dengan startIndex.
      .skip(startIndex)

      // Membatasi jumlah data yang diambil, sesuai dengan limit
      .limit(limit);

    return new Response(JSON.stringify(listings), {
      status: 200,
    });
  } catch (error) {
    console.log("Error getting posts:", error);
    return new Response("Error getting posts", { status: 500 });
  }
};
