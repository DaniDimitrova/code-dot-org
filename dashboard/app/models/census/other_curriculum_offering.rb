# == Schema Information
#
# Table name: other_curriculum_offerings
#
#  id                       :integer          not null, primary key
#  curriculum_provider_name :string(255)      not null
#  school_id                :string(12)       not null
#  course                   :string(255)      not null
#  school_year              :integer          not null
#  created_at               :datetime         not null
#  updated_at               :datetime         not null
#
# Indexes
#
#  fk_rails_5682e60354                      (school_id)
#  index_other_curriculum_offerings_unique  (curriculum_provider_name,school_id,course,school_year) UNIQUE
#

class Census::OtherCurriculumOffering < ApplicationRecord
end
