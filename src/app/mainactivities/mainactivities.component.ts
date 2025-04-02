import { Component, inject, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Announcement } from '../post-validation-hub/post-validation-hub.component';
import { MatDialog } from '@angular/material/dialog';
import { MatDialogModule } from '@angular/material/dialog';
import { FormBuilder } from '@angular/forms';
import { Firestore, collection, doc, getDocs, getDoc, setDoc, writeBatch, CollectionReference, DocumentData, Timestamp } from '@angular/fire/firestore';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

@Component({
    selector: 'app-mainactivities',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './mainactivities.component.html',
    styleUrl: './mainactivities.component.css'
})
export class MainactivitiesComponent {


    public slideIndex: number = 0;
    public slides: HTMLCollectionOf<Element>;
    public queue: Announcement[] = [];


    defaultImageUrl: string = 'backgroundAboutUs.png'; // Make sure to define your default image URL

    private firestore: Firestore = inject(Firestore);

    constructor() {

        this.slides = document.getElementsByClassName("carousel-item");
    }

    ngOnInit() {
        this.fetchAnnouncements();
        this.addThumbnailEventListeners();

        this.init3DModel();
    }

    private init3DModel(): void {
        const container = document.getElementById('three-container');
        if (!container) return;
      
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
        camera.position.set(0, 2, 5);
        camera.lookAt(0, 0.5, 0);
      
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);
      
        // Lights
        scene.add(new THREE.HemisphereLight(0xffffff, 0x000000, 1));
        scene.add(new THREE.AmbientLight(0xffffff, 0.5));
        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 10, 10);
        scene.add(dirLight);
      
        const controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.update();
      
        const loader = new GLTFLoader();
        let model: THREE.Object3D;
        let mixer: THREE.AnimationMixer;
        const clock = new THREE.Clock();
      
        // Mouse tracking
        let targetRotationX = 0;
        let targetRotationY = 0;
      
        document.addEventListener('mousemove', (event) => {
          const mouseX = (event.clientX / window.innerWidth) * 2 - 1;
          const mouseY = (event.clientY / window.innerHeight) * 2 - 1;
          targetRotationY = mouseX * 0.5;
          targetRotationX = mouseY * 0.3;
        });
      
        // Load model
        loader.load(
          'assets/3D/robot_playground.glb',
          (gltf) => {
            model = gltf.scene;
            model.position.set(0, -0.5, 0);
            scene.add(model);
      
            if (gltf.animations.length > 0) {
              mixer = new THREE.AnimationMixer(model);
              gltf.animations.forEach((clip) => {
                mixer.clipAction(clip).play();
              });
            }
      
            // Initial scale
            updateModelScale();
          },
          undefined,
          (error) => {
            console.error("Model load error:", error);
          }
        );
      
        function updateModelScale() {
          if (!model) return;
          const baseWidth = 450; // reference width
          const scale = (container ? container.clientWidth / baseWidth : 1) * 0.8; // Scaled to half
          model.scale.set(scale, scale, scale);
        }
      
        function onResize() {
          if (!container) return;
          const width = container.clientWidth;
          const height = container.clientHeight;
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
          renderer.setSize(width, height);
          updateModelScale();
        }
      
        window.addEventListener('resize', onResize);
        onResize(); // call once initially
      
        function animate() {
          requestAnimationFrame(animate);
          const delta = clock.getDelta();
      
          if (mixer) mixer.update(delta);
          if (model) {
            model.rotation.y += (targetRotationY - model.rotation.y) * 0.1;
            model.rotation.x += (targetRotationX - model.rotation.x) * 0.1;
          }
      
          renderer.render(scene, camera);
        }
      
        animate();
      }
       
    
    async fetchAnnouncements() {
        try {
            // Reference to the 'validated-posts' collection
            const collectionRef = collection(this.firestore, 'validated-posts');
            const collectionSnapshot = await getDocs(collectionRef);
    
            // Check if the collection has documents
            if (collectionSnapshot.empty) {
                console.log('No documents found in the validated-posts collection.');
                this.queue = [];
                return;
            }
    
            // Clear the queue before adding new data
            this.queue = []; 
            
            // Iterate over the documents and add them to the queue
            collectionSnapshot.forEach(doc => {
                if (this.queue.length >= 6) {
                    return; // Stop adding more if queue already has 6 items
                }
    
                const data = doc.data() as Omit<Announcement, 'title'>; // Assuming `Announcement` type
    
                // Check if the status is 'approved' before adding to the queue
                if (data.status === 'approved') {
                    this.queue.push({
                        title: doc.id, // Assuming the document ID or a specific field should be used as title
                        ...data
                    });
                }
            });
    


            this.sortAnnouncementsByDate();
    
            // Log the fetched data
            //console.log('Fetched Announcements:', this.queue);
        } catch (error) {
            console.error('Error fetching announcements:', error);
        }
    }
    
    private sortAnnouncementsByDate() {
        this.queue.sort((a, b) => {
            // Assuming 'createdAt' is the timestamp field in Firestore
            const dateA = a.date instanceof Timestamp ? a.date.toMillis() : 0;
            const dateB = b.date instanceof Timestamp ? b.date.toMillis() : 0;
            return dateB - dateA; // Sort in descending order (most recent first)
        });
    }
    


    public moveSlide(n: number): void {
        this.slideIndex += n;
        if (this.slideIndex >= this.queue.length) this.slideIndex = 0;
        if (this.slideIndex < 0) this.slideIndex = this.queue.length - 1;
        this.showSlides();
      }

    private showSlides(): void {
        const slides = document.querySelectorAll('.carousel__slide');
        slides.forEach((slide, index) => {
          (slide as HTMLElement).style.display = index === this.slideIndex ? 'block' : 'none';
        });
      }

     public setSlide(index: number): void {
    this.slideIndex = index;
    this.showSlides();
  }

  private addThumbnailEventListeners() {
    const thumbnails = document.querySelectorAll('.carousel__thumbnails img');

    thumbnails.forEach((thumbnail) => {
        thumbnail.addEventListener('click', () => {
            thumbnails.forEach(img => img.classList.remove('selected')); // Deselect all
            (thumbnail as HTMLImageElement).classList.add('selected'); // Select clicked
        });
    });
}
  
}



document.addEventListener('DOMContentLoaded', (event) => {
    const postWrappers = document.querySelectorAll('.post_wrapper');
    const modelContainer = document.getElementById('three-container') as HTMLElement;
    const scrisElements = document.querySelectorAll('.titleDescriptionCompany') as NodeListOf<HTMLElement>;

    postWrappers.forEach((postWrapper) => {
        postWrapper.addEventListener('mouseover', () => {
            modelContainer.style.opacity = '0.1';
            modelContainer.style.filter = 'blur(1px)';
            scrisElements.forEach((scris) => {
                scris.style.opacity = '100%';
            });
        });

        postWrapper.addEventListener('mouseout', () => {
            modelContainer.style.opacity = '1';
            modelContainer.style.filter = 'blur(0)';
            scrisElements.forEach((scris) => {
                scris.style.opacity = '0%';
            });
        });
    });
});



