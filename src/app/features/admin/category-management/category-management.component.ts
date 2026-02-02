
import { Component, Injectable } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface Category {
  id: string;
  name: string;
  description: string;
  disabled?: boolean; // disabled=true -> Inactive
}

@Component({
  standalone: true,
  selector: 'app-category-management',
  imports: [CommonModule, FormsModule ],
  templateUrl: './category-management.component.html',
  styleUrls: ['./category-management.component.css']
})
@Injectable({ providedIn: 'root' })
export class CategoryManagementComponent {
  // Corporate feedback categories (sample)
  categories: Category[] = [
    { id: 'CAT-001', name: 'Communication Skills',    description: 'Clarity, listening, and transparency in interactions', disabled: false },
    { id: 'CAT-002', name: 'Teamwork & Collaboration', description: 'Working effectively with peers to achieve shared goals', disabled: false },
    { id: 'CAT-003', name: 'Leadership & Initiative',  description: 'Ownership, guidance, and proactive problem-solving', disabled: true }, // Inactive
    { id: 'CAT-004', name: 'Adaptability & Flexibility', description: 'Positive response to change and resilience under pressure', disabled: false },
    { id: 'CAT-005', name: 'Problem-Solving & Decision Making', description: 'Analyzing issues and making sound, timely decisions', disabled: false },
    { id: 'CAT-006', name: 'Technical Expertise',      description: 'Depth of knowledge in relevant tools, tech, and practices', disabled: false },
    { id: 'CAT-007', name: 'Time Management & Productivity', description: 'Prioritization, meeting deadlines, and efficiency', disabled: false },
    { id: 'CAT-008', name: 'Innovation & Creativity',  description: 'Generating ideas, improving processes, and experimentation', disabled: true }, // Inactive
    { id: 'CAT-009', name: 'Customer Focus',           description: 'Understanding client needs and delivering quality service', disabled: false },
    { id: 'CAT-010', name: 'Accountability & Reliability', description: 'Owning responsibilities and delivering consistently', disabled: false }
  ];

  // Inline Add/Edit form state (ID removed from the form model for add; still kept in object)
  formOpen = false;
  editIndex: number | null = null;
  formModel: Category = { id: '', name: '', description: '', disabled: false };

  /** --- ID helpers --- */

  /** Extract numeric suffix from IDs like "CAT-001" -> 1 */
  private parseCatNumber(id: string): number {
    if (!id) return 0;
    const match = id.match(/\d+$/);
    return match ? parseInt(match[0], 10) : 0;
  }

  /** Format a number -> "CAT-XXX" (3-digit zero padding) */
  private formatCatId(num: number): string {
    const padded = String(num).padStart(3, '0');
    return `CAT-${padded}`;
  }

  /** Find max numeric suffix from existing IDs and return the next ID */
  private getNextCategoryId(list: Category[]): string {
    const maxNum = list.reduce((max, c) => {
      const n = this.parseCatNumber(c.id);
      return n > max ? n : max;
    }, 0);
    return this.formatCatId(maxNum + 1);
  }

  /** --- Form actions --- */

  /** Open empty form for adding a new category (ID is not part of the form) */
  openAddForm(): void {
    this.editIndex = null;
    this.formModel = { id: '', name: '', description: '', disabled: false };
    this.formOpen = true;
  }

  /** Open prefilled form for updating a category (ID displayed read-only) */
  editCategory(index: number): void {
    const cat = this.categories[index];
    this.editIndex = index;
    this.formModel = { ...cat };
    this.formOpen = true;
  }

  /** Disable/Enable -> toggles disabled flag */
  toggleDisabled(index: number): void {
    const cat = this.categories[index];
    cat.disabled = !cat.disabled;
  }

  /** Save new or updated category */
  saveCategory(): void {
    const name = (this.formModel.name || '').trim();
    const desc = (this.formModel.description || '').trim();

    if (!name || !desc) {
      return; // basic guard; add validation UI if needed
    }

    if (this.editIndex === null) {
      // ADD: auto-generate ID
      const id = this.getNextCategoryId(this.categories);

      const newCat: Category = {
        id,
        name,
        description: desc,
        disabled: !!this.formModel.disabled
      };
      this.categories = [...this.categories, newCat];
    } else {
      // UPDATE: keep ID unchanged; update other fields
      const currentId = this.categories[this.editIndex].id;

      const updated: Category = {
        id: currentId,
        name,
        description: desc,
        disabled: !!this.formModel.disabled
      };
      const next = [...this.categories];
      next[this.editIndex] = updated;
      this.categories = next;
    }

    this.closeForm();
  }

  /** Close the inline form */
  closeForm(): void {
    this.formOpen = false;
    this.editIndex = null;
    this.formModel = { id: '', name: '', description: '', disabled: false };
  }
}
