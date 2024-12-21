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
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const UploadListingSection = () => {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const [error, setError] = useState<string | boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    imageUrls: [] as string[],
    name: "",
    description: "",
    address: "",
    type: "sale",
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });

  const [uploading, setUploading] = useState(false);
  const [imageUploadError, setImageUploadError] = useState<
    string | boolean | null
  >(null);

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
      // if (formData.imageUrls.length < 1)
      //   return setError("You must upload at least one image");
      if (+formData.regularPrice < +formData.discountPrice)
        return setError("Discount price must be lower than regular price");

      setLoading(true);
      setError(false);
      const res = await fetch("/api/listing/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          userMongoId: user?.publicMetadata.userMongoId,
        }),
      });
      const data = await res.json();
      setLoading(false);

      if (data.success === false) {
        setError(data.message);
      }
      router.push(`/listing/${data._id}`);
    } catch (error) {
      setError("Something went wrong: " + error);
      console.log(error);
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return <h1 className="text-center text-2xl my-7 font-bold">Loading...</h1>;
  }

  if (!isSignedIn) {
    return (
      <h1 className="text-center text-2xl my-7 font-bold">
        You are not Authorized to view this page
      </h1>
    );
  }

  return (
    <>
      <form
        className="flex flex-col sm:flex-row gap-6 lg:gap-16"
        onSubmit={handleSubmit}
      >
        <div className="flex flex-col gap-4 flex-1">
          <input
            type="text"
            placeholder="Name"
            className="border p-3 rounded-lg"
            id="name"
            maxLength={62}
            minLength={5}
            required
            onChange={handleChange}
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
                min="50"
                max="10000000"
                required
                className="p-3 border border-gray-300 rounded-lg"
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
          {formData.imageUrls === formData.imageUrls && imageUploadError && (
            <p className="text-red-700 text-sm">
              {imageUploadError && imageUploadError}
            </p>
          )}

          {/* kalau berhasil */}
          {formData.imageUrls.length > 0 &&
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

          <button
            className="p-3 bg-sky-700 text-slate-200 rounded-lg uppercase hover:opacity-85 shadow-xl disabled:opacity-50"
            disabled={loading || uploading}
          >
            {loading ? "Creating..." : "Create Listing"}
          </button>
          {error && <p className="text-red-700">{error}</p>}
        </div>
      </form>
    </>
  );
};

export default UploadListingSection;
