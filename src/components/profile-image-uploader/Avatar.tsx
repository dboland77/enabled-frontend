import React, { useEffect, useRef, useState } from 'react';
import styles from './avatar.module.css';

export default function ProfileImageUploader() {
  const widgetRef = useRef<any>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

  useEffect(() => {
    // @ts-ignore
    widgetRef.current = window.cloudinary.createUploadWidget(
      {
        cloudName,
        uploadPreset,
        folder: 'profile_pics',
        sources: ['local', 'url', 'camera'],
        multiple: false,
      },
      (error: any, result: any) => {
        if (!error && result && result.event === 'success') {
          setImageUrl(result.info.secure_url);
        }
      }
    );
  }, [cloudName, uploadPreset]);
  return (
    <section className="content">
      <div className={styles.avatarUpload}>
        <div className={styles.avatarEdit}>
          <button type="button" onClick={() => widgetRef.current.open()} className="">
            Add Profile Picture
          </button>
        </div>
        <div className={styles.avatarPreview}>
          {imageUrl && (
            <img
              src={imageUrl}
              className={styles.profileUserImg}
              id="imagePreview"
              alt="User Profile"
            />
          )}
        </div>
      </div>
    </section>
  );
}
