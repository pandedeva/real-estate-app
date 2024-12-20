"use client";
import React, { useState } from "react";
import { app } from "../firebase";
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import Image from "next/image";

const UploadListingSection = () => {
  // const [files, setFiles] = useState([]);
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    imageUrls: [],
  });
  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<
    string | boolean | null
  >(null);

  //! STOP UPLOADING IMAGE CUZ ILL BE PAID WHEN UPLOADING MORE THAN 5GB

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
            imageUrls: formData.imageUrls.concat(urls),
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

  return (
    <>
      <form className="flex flex-col sm:flex-row gap-6 lg:gap-16">
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={10}
            required
          />
          <textarea
            placeholder="Description"
            className="border p-3 rounded-lg"
            id="description"
            required
          />
          <input
            type="text"
            placeholder="Address"
            className="border p-3 rounded-lg"
            id="address"
            required
          />

          <div className="flex gap-6 flex-wrap">
            <div className="flex gap-2">
              <input type="checkbox" id="sale" className="w-5" />
              <span>Sell</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="rent" className="w-5" />
              <span>Rent</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="parking" className="w-5" />
              <span>Parking spot</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="furnished" className="w-5" />
              <span>Furnished</span>
            </div>
            <div className="flex gap-2">
              <input type="checkbox" id="offer" className="w-5" />
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
              />
              <p>Baths</p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="regularPrice"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Regular price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                id="discountPrice"
                min="1"
                max="10"
                required
                className="p-3 border border-gray-300 rounded-lg"
              />
              <div className="flex flex-col items-center">
                <p>Discounted price</p>
                <span className="text-xs">($ / month)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex flex-col flex-1 gap-4">
          <p className="font-semibold">
            Images:
            <span className="font-normal text-gray-600 ml-2">
              The first image will be the cover (max 6)
            </span>
          </p>

          <div className="flex gap-4">
            <input
              className="p-3 border border-gray-300 rounded w-full"
              type="file"
              id="images"
              accept="image/*"
              multiple
              onChange={(e) => {
                // setFiles(e.target.files ?? []);

                // kalau files null pake empty array
                setFiles(Array.from(e.target.files ?? []));
              }}
            />
            {/* DONT UPLOAD IMAGE MORE THAN 5GB OR IT WILL BE CHARGE :( */}
            <button
              className="p-3 border bg-sky-400 font-semibold rounded uppercase shadow-lg hover:opacity-70 disabled:opacity-50"
              disabled={uploading}
              onClick={handleImgSubmit}
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </div>

          {/* kalau error uploading */}
          <p className="text-red-700 text-sm">
            {imageUploadError && imageUploadError}
          </p>

          {/* !!!!! STOP UPLOADING IMAGE CUZ ILL BE PAID WHEN UPLOADING MORE THAN 5GB  */}
          {/* kalau berhasil */}
          {formData.imageUrls.length > 0 &&
            formData.imageUrls !== formData.imageUrls &&
            formData.imageUrls.map((url, index) => (
              <div
                key={url}
                className="flex justify-between p-3 border items-center"
              >
                <Image
                  src={url}
                  alt="listing image"
                  className="object-contain rounded-lg"
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

          <button className="p-3 bg-sky-700 text-slate-200 rounded-lg uppercase hover:opacity-85 shadow-xl disabled:opacity-50">
            Create Listing
          </button>
        </div>
      </form>
    </>
  );
};

export default UploadListingSection;
