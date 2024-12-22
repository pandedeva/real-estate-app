"use client";
import { useEffect, useState } from "react";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { app } from "@/firebase";
import { useUser } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";

const UpdateListingSection = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const [files, setFiles] = useState<File[]>([]);
  const pathname = usePathname(); // mengambil url sekarang dengan usePathname
  const listingId = pathname.split("/").pop(); // mengambil id listing dari url
  //  * kalau URL /listing/12345 lalu di split menjadi ["/", "listing", "12345"] lalu di pop(pop mengambil data terakhir dari array) maka hasilnya 12345

  const [formData, setFormData] = useState({
    imageUrls: [] as string[],
    name: "",
    description: "",
    address: "",
    type: "rent",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState<
    string | boolean | null
  >(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchListing = async () => {
      const res = await fetch("/api/listing/get", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          listingId,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      //  mengambil data ke index ke 0
      setFormData(data[0]);
    };
    fetchListing();
    /* eslint-disable */
  }, []);

  const handleImgSubmit = () => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);

      // membuat array kosong untuk mengpush 1 atau lebih gambar ke function storeImage
      const data = [];
      for (let i = 0; i < files.length; i++) {
        data.push(storeImage(files[i]));
      }

      Promise.all(data)
        .then((urls) => {
          setFormData({
            // simpan data lama dan tambahkan data baru dari imageUrls
            // concat bertujuan untuk menyatukan dua buah atau lebih array
            ...formData,
            // imageUrls: formData.imageUrls.concat(urls),

            // * mengumpulkan dua array menjadi satu dari formData digabung dengan urls
            // * as string itu bertujuan agar tipe data beneran string <3
            imageUrls: [...formData.imageUrls, ...(urls as string[])],
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          console.error("Error uploading images:", err);
          setImageUploadError("Image upload failed (2 mb max per image)");
          setUploading(false);
        });
    } else {
      setImageUploadError("You can only upload 6 images per listing");
      setUploading(false);
    }
  };

  const storeImage = async (file: File) => {
    return new Promise((resolve, reject) => {
      // import getStorage dan app dari firebase
      const storage = getStorage(app);
      // buat fileName dan masukan fileName dan waktu saat ini agar file name unique
      const fileName = new Date().getTime() + file.name;
      // buat storageRef dan masukan storage dan fileName
      const storageRef = ref(storage, fileName);
      // uploadTask dan masukan uploadBytesResumable ke storageRef
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            // buat progress dari bytesTransferred dan totalBytes agar tau berapa persen uploading berjalan
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },

        () => {
          // kalau berhasil masukan getDownloadURL ke resolve
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index: number) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  /* eslint-disable */
  const handleChange = (e: any) => {
    if (e.target.id === "sale" || e.target.id === "rent") {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }
    if (
      e.target.id === "parking" ||
      e.target.id === "furnished" ||
      e.target.id === "offer"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }
    if (
      e.target.type === "number" ||
      e.target.type === "text" ||
      e.target.type === "textarea"
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  /* eslint-disable */
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    try {
      // ! ini saya matikan karna firebase berbayar :) listing.model rubah ke required nanti
      //   if (formData.imageUrls.length < 1)
      //     return setError("You must upload at least one image");

      // (+) Dipakai buat mengonversi string (kalau formData berasal dari input form) jadi angka.
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");

      setLoading(true);
      setError(false);
      const res = await fetch("/api/listing/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userMongoId: user?.publicMetadata.userMongoId,
          listingId,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message);
      }

      router.push(`/listing/${data._id}`);
    } catch (error) {
      setError("Something went wrong on updating: " + error);
      console.log(error);
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <h1 className="text-center text-xl my-7 font-bold">Loading...</h1>;
  }

  if (!isSignedIn) {
    return (
      <h1 className="text-center text-xl my-7 font-bold text-red-500">
        You are not Authorized to view this page
      </h1>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={4}
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="sale"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "sale"}
              />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="rent"
                className="w-5"
                onChange={handleChange}
                checked={formData.type === "rent"}
              />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="parking"
                className="w-5"
                onChange={handleChange}
                checked={formData.parking}
              />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="furnished"
                className="w-5"
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input
                type="checkbox"
                id="offer"
                className="w-5"
                onChange={handleChange}
                checked={formData.offer}
              />
              <span>Offer</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bedrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <p>Beds</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="bathrooms"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <p>Baths</p>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                required
                className="p-3 border border-gray-300 rounded-lg"
                min="50"
                max="10000000"
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
            {formData.offer && (
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  id="discountPrice"
                  min="0"
                  max="10000000"
                  required
                  className="p-3 border border-gray-300 rounded-lg"
                  onChange={handleChange}
                  value={formData.discountPrice}
                />
                <div className="flex flex-col items-center">
                  <p>Discounted price</p>
                  <span className="text-xs">($ / month)</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>
          <div className="flex gap-4">
            <input
              onChange={(e) => {
                // setFiles(e.target.files ?? []);

                // kalau files null pake empty array
                setFiles(Array.from(e.target.files ?? []));
              }}
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
            />
            <button
              disabled={uploading}
              onClick={handleImgSubmit}
              className="p-3 text-green-700 border border-green-700 rounded uppercase hover:shadow-lg disabled:opacity-80"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>
          {formData.imageUrls.length > 0 &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <Image
                  src={url}
                  alt="listing image"
                  className="w-20 h-20 object-contain rounded-lg"
                  width={150}
                  height={150}
                />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className="p-3 text-red-700 rounded-lg uppercase hover:opacity-75"
                >
                  Delete
                </button>
              </div>
            ))}
          <button
            disabled={loading || uploading}
            className="p-3 bg-slate-700 text-white rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
          >
            {loading ? "Updating..." : "Update listing"}
          </button>
          {error && <p className="text-red-700 text-sm">{error}</p>}
        </div>
      </form>
    </>
  );
};

export default UpdateListingSection;
