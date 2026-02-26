import { Component, Injectable, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AdminCategoryService, 
  CategoryReadDto, 
  CategoryCreateDto, 
  CategoryUpdateDto 
} from '../services/admin-category.service';

export interface Category {
  id: string;
  name: string;
  description: string;
  disabled?: boolean;
}

@Component({
  standalone: true,
  selector: 'app-category-management',
  imports: [CommonModule, FormsModule],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
@Injectable({ providedIn: 'root' })
export class CategoryManagementComponent implements OnInit {
  
  // --- UI State ---
  categories: Category[] = [];
  loading = false;
  error: string | null = null;

  // --- Form State ---
  formOpen = false;
  editIndex: number | null = null;
  formModel: Category = { id: '', name: '', description: '', disabled: false };

  constructor(private categoryService: AdminCategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  // ==========================================
  // API INTERACTIONS
  // ==========================================

  loadCategories(): void {
    this.loading = true;
    this.error = null;

    this.categoryService.getAll().subscribe({
      next: (data: CategoryReadDto[]) => {
        this.categories = data.map(dto => ({
          id: dto.categoryId,
          name: dto.categoryName,
          description: dto.description || '',
          disabled: !dto.isActive
        }));
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load categories';
        this.loading = false;
        console.error('Error loading categories:', err);
      }
    });
  }

  deleteCategory(index: number): void {
    const cat = this.categories[index];
    
    if (!confirm(`Are you sure you want to delete "${cat.name}"? This action cannot be undone.`)) {
      return;
    }

    this.categoryService.delete(cat.id).subscribe({
      next: () => {
        this.categories = this.categories.filter((_, i) => i !== index);
      },
      error: (err) => {
        const msg = err?.error?.message || 'Failed to delete category. It may be in use.';
        this.error = msg;
        alert(msg);
        console.error('Delete error:', err);
      }
    });
  }

  toggleDisabled(index: number): void {
    const cat = this.categories[index];
    const newStatus = !cat.disabled;
    
    const updateDto: CategoryUpdateDto = {
      categoryName: cat.name,
      description: cat.description,
      isActive: !newStatus
    };

    this.categoryService.update(cat.id, updateDto).subscribe({
      next: () => {
        cat.disabled = newStatus;
      },
      error: (err) => {
        this.error = 'Failed to update category status';
        console.error('Toggle status error:', err);
      }
    });
  }

  // ==========================================
  // FORM ACTIONS
  // ==========================================

  openAddForm(): void {
    this.editIndex = null;
    this.formModel = { id: '', name: '', description: '', disabled: false };
    this.formOpen = true;
  }

  editCategory(index: number): void {
    const cat = this.categories[index];
    this.editIndex = index;
    this.formModel = { ...cat }; // Create a copy for the form
    this.formOpen = true;
  }

  closeForm(): void {
    this.formOpen = false;
    this.editIndex = null;
    this.formModel = { id: '', name: '', description: '', disabled: false };
  }

  saveCategory(): void {
    const name = (this.formModel.name || '').trim();
    const desc = (this.formModel.description || '').trim();

    // Basic Validation
    if (!name || !desc) return; 

    if (this.editIndex === null) {
      this.createNewCategory(name, desc);
    } else {
      this.updateExistingCategory(name, desc);
    }
  }

  // ==========================================
  // PRIVATE HELPER METHODS
  // ==========================================

  private createNewCategory(name: string, desc: string): void {
    const newId = this.getNextCategoryId(this.categories);

    const createDto: CategoryCreateDto = {
      categoryId: newId,
      categoryName: name,
      description: desc
    };

    this.categoryService.create(createDto).subscribe({
      next: (created) => {
        const newCat: Category = {
          id: created.categoryId,
          name: created.categoryName,
          description: created.description || '',
          disabled: !created.isActive
        };
        this.categories = [...this.categories, newCat];
        this.closeForm();
      },
      error: (err) => {
        this.error = 'Failed to create category';
        console.error('Create error:', err);
      }
    });
  }

  private updateExistingCategory(name: string, desc: string): void {
    const currentId = this.categories[this.editIndex!].id;

    const updateDto: CategoryUpdateDto = {
      categoryName: name,
      description: desc,
      isActive: !this.formModel.disabled
    };

    this.categoryService.update(currentId, updateDto).subscribe({
      next: () => {
        const updatedCat: Category = {
          id: currentId,
          name,
          description: desc,
          disabled: !!this.formModel.disabled
        };
        
        // Update the array immutably
        const nextCategories = [...this.categories];
        nextCategories[this.editIndex!] = updatedCat;
        this.categories = nextCategories;
        
        this.closeForm();
      },
      error: (err) => {
        this.error = 'Failed to update category';
        console.error('Update error:', err);
      }
    });
  }

  // --- ID Generation Logic ---
  private getNextCategoryId(list: Category[]): string {
    const maxNum = list.reduce((max, c) => {
      const n = this.parseCatNumber(c.id);
      return n > max ? n : max;
    }, 0);
    return this.formatCatId(maxNum + 1);
  }

  private parseCatNumber(id: string): number {
    if (!id) return 0;
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 0;
  }

  private formatCatId(num: number): string {
    return `CAT-${String(num).padStart(3, '0')}`;
  }
}