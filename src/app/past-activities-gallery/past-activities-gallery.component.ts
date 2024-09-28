import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-past-activities-gallery',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './past-activities-gallery.component.html',
  styleUrls: ['./past-activities-gallery.component.css']
})
export class PastActivitiesGalleryComponent implements OnInit {
  imageUrls: { url: string, aspectRatio: number }[] = [];
  private storage = getStorage();
  galleryRef: string | undefined;
  announcement: Announcement | undefined = {
    title: 'Default Title',
    description: 'Default Description',
    refLink: '',
    username: 'Default User',
    imageLink: 'default-image-url.jpg',
    date: '',
    status: 'past-activities',
    pastActivity: true,
    imagesRef: 'none'
  };

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.route.paramMap.subscribe(() => {
      const state = history.state as { galleryRef: string; announcement: Announcement };
      console.log('Received state:', state);

      if (state.announcement) {
        this.announcement = state.announcement;
        this.galleryRef = this.announcement.imagesRef;
        if (this.galleryRef) {
          this.getAllImagesFromFolder(this.galleryRef);
        } else {
          console.error('No galleryRef provided in route state');
        }
      }
    });
  }

  async fetchImageUrls(galleryRef: string) {
    const listRef = ref(this.storage, galleryRef);

    try {
      const res = await listAll(listRef);
      const urlPromises = res.items.map((itemRef) => getDownloadURL(itemRef));
      const urls = await Promise.all(urlPromises);

      // Fetch dimensions for each image
      const imagesWithAspectRatio = await Promise.all(urls.map(async (url) => {
        const { aspectRatio } = await this.getAspectRatio(url);
        return { url, aspectRatio };
      }));

      this.imageUrls = imagesWithAspectRatio;
    } catch (error) {
      console.error('Error fetching image URLs:', error);
    }
  }

  async getAspectRatio(url: string): Promise<{ aspectRatio: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        const aspectRatio = img.width / img.height;
        resolve({ aspectRatio });
      };
      img.onerror = (error) => reject(error);
    });
  }

  async getAllImagesFromFolder(folderPath: string): Promise<void> {
    try {
      const folderRef = ref(this.storage, folderPath);
      const result = await listAll(folderRef);

      this.imageUrls = [];

      for (const itemRef of result.items) {
        const downloadURL = await getDownloadURL(itemRef);
        const { aspectRatio } = await this.getAspectRatio(downloadURL);
        this.imageUrls.push({ url: downloadURL, aspectRatio });
      }

      console.log('All image URLs with aspect ratios:', this.imageUrls);

    } catch (error) {
      console.error('Error retrieving images from folder:', error);
    }
  }
}
