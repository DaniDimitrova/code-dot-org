module Pd
  class WorkshopDailySurveyController < ApplicationController
    include WorkshopConstants
    include JotForm::EmbedHelper

    # The POST submit route will be redirected to from JotForm, after form submission
    skip_before_action :verify_authenticity_token, only: %w(submit_general submit_facilitator)

    LAST_DAY = 5

    # Require login
    authorize_resource class: 'Pd::Enrollment'

    # General workshop daily survey.
    # GET '/pd/workshop_survey/day/:day'
    # Where day 0 is the pre-workshop survey, and days 1-5 are the 1st through 5th sessions (index 0-4)
    #
    # The JotForm survey, on submit, will redirect to the new_facilitator route (see below)
    # for the relevant session id.
    # The pre-workshop survey, which has no session id, will redirect to thanks.
    def new_general
      # Accept days 0 through 4. Day 5 is the post workshop survey and should use the new_post route
      day = params[:day].to_i
      return render_404 if day < 0 || day > 4

      workshop = Workshop.
        where(ended_at: nil, subject: [SUBJECT_TEACHER_CON, SUBJECT_SUMMER_WORKSHOP]).
        nearest_attended_or_enrolled_in_by(current_user)

      return render :not_enrolled unless workshop

      session = nil
      if day > 0
        session = workshop.sessions[day - 1]
        return render_404 unless session
        return render :too_late unless session.open_for_attendance?

        return render :no_attendance unless session.attendances.exists?(teacher: current_user)
      end

      @form_id = WorkshopDailySurvey.get_form_id_for_day day

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        workshopId: workshop.id,
        day: day,
        formId: @form_id,
        sessionId: session&.id,
      }

      return redirect_general(key_params) if response_exists_general?(key_params)

      @form_params = key_params.merge(
        userName: current_user.name,
        userEmail: current_user.email,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        submitRedirect: url_for(action: 'submit_general', params: {key: key_params})
      )
    end

    # POST /pd/workshop_survey/submit
    def submit_general
      WorkshopDailySurvey.create_placeholder!(
        user_id: key_params[:userId],
        pd_workshop_id: key_params[:workshopId],
        day: key_params[:day],
        form_id: key_params[:formId],
        submission_id: params[:submission_id]
      )

      redirect_general(key_params)
    end

    # Facilitator-specific questions
    # GET /pd/workshop_survey/facilitators/:session_id(/:facilitator_index)
    # :session_id is the id of the workshop session.
    # :facilitator_index is the optional (default 0, first) index in sorted session.workshop.facilitators
    #
    # The JotForm survey, on submit, will redirect back to this same route, but with
    # facilitatorPosition as facilitator_index, thus incrementing it by 1.
    def new_facilitator
      session = Session.find(params[:session_id])
      workshop = session.workshop
      day = workshop.sessions.index(session) + 1

      # Post workshop survey (last day) does not need to be taken while the session is still open,
      # and has less strict attendance requirements.
      unless day == LAST_DAY
        return render :too_late unless session.open_for_attendance?

        attendance = session.attendances.find_by(teacher: current_user)
        return render :no_attendance unless attendance
      end

      facilitator_index = params[:facilitator_index]&.to_i || 0
      facilitators = workshop.facilitators.order(:name, :id)
      facilitator = facilitators[facilitator_index]

      # Out of facilitators? Done.
      return redirect_to action: :thanks unless facilitator

      @form_id = WorkshopFacilitatorDailySurvey.form_id

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        day: day,
        sessionId: session.id,
        facilitatorId: facilitator.id,
        facilitatorIndex: facilitator_index,
        formId: @form_id,
      }

      return redirect_facilitator(key_params) if response_exists_facilitator?(key_params)

      @form_params = key_params.merge(
        workshopId: workshop.id,
        userName: current_user.name,
        userEmail: current_user.email,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        facilitatorPosition: facilitator_index + 1,
        facilitatorName: facilitator.name,
        numFacilitators: facilitators.size,
        submitRedirect: url_for(action: 'submit_facilitator', params: {key: key_params})
      )
    end

    # POST /pd/workshop_survey/facilitators/submit
    def submit_facilitator
      WorkshopFacilitatorDailySurvey.create_placeholder!(
        user_id: key_params[:userId],
        day: key_params[:day],
        pd_session_id: key_params[:sessionId],
        facilitator_id: key_params[:facilitatorId],
        form_id: key_params[:formId],
        submission_id: params[:submission_id]
      )

      redirect_facilitator(key_params)
    end

    # Post workshop survey. This one will be emailed and displayed in the my PL page,
    # and can persist for more than a day, so it uses an enrollment code to be tied to a specific workshop.
    # GET /pd/workshop_survey/post/:enrollment_code
    def new_post
      enrollment = Enrollment.find_by!(code: params[:enrollment_code])
      workshop = enrollment.workshop
      session = workshop.sessions[LAST_DAY - 1]
      return render_404 unless session

      return redirect_to :pd_workshop_survey_thanks if WorkshopDailySurvey.exists?(user: current_user, pd_workshop: workshop, day: LAST_DAY)
      @form_id = WorkshopDailySurvey.get_form_id_for_day LAST_DAY

      # Pass these params to the form and to the submit redirect to identify unique responses
      key_params = {
        environment: Rails.env,
        userId: current_user.id,
        workshopId: workshop.id,
        day: LAST_DAY,
        formId: @form_id,
        sessionId: session&.id,
      }

      return redirect_general(key_params) if response_exists_general?(key_params)

      @form_params = key_params.merge(
        userName: current_user.name,
        userEmail: current_user.email,
        workshopCourse: workshop.course,
        workshopSubject: workshop.subject,
        regionalPartnerName: workshop.regional_partner&.name,
        submitRedirect: url_for(action: 'submit_general', params: {key: key_params})
      )

      # Same view as the general daily survey
      render :new_general
    end

    # GET /pd/workshop_survey/thanks
    def thanks
    end

    protected

    def response_exists_general?(key_params)
      WorkshopDailySurvey.response_exists?(
        user_id: key_params[:userId],
        pd_workshop_id: key_params[:workshopId],
        day: key_params[:day],
        form_id: key_params[:formId]
      )
    end

    def redirect_general(key_params)
      session_id = key_params[:sessionId]
      if session_id.present?
        redirect_to action: :new_facilitator, session_id: session_id, facilitator_index: 0
      else
        redirect_to action: :thanks
      end
    end

    def response_exists_facilitator?(key_params)
      WorkshopFacilitatorDailySurvey.response_exists?(
        user_id: key_params[:userId],
        pd_session_id: key_params[:sessionId],
        facilitator_id: key_params[:facilitatorId],
        form_id: key_params[:formId]
      )
    end

    def redirect_facilitator(key_params)
      session = Session.find(key_params[:sessionId])
      next_facilitator_index = key_params[:facilitatorIndex].to_i + 1
      if next_facilitator_index.between?(1, session.workshop.facilitators.size - 1)
        redirect_to action: :new_facilitator, session_id: session.id, facilitator_index: next_facilitator_index
      else
        redirect_to action: :thanks
      end
    end

    def key_params
      @key_params ||= params.require(:key).tap do |key_params|
        raise ActiveRecord::RecordNotFound unless key_params[:environment] == Rails.env
      end
    end
  end
end
