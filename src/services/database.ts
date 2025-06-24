import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  onSnapshot,
  Timestamp,
  writeBatch,
  increment
} from 'firebase/firestore'
import { db } from './firebase'
import { 
  User, 
  Car, 
  Request, 
  Diagnosis, 
  Part, 
  Transaction, 
  NotificationData,
  MaintenanceRecord,
  ActivityLog,
  ActivityType,
  MechanicStats,
  InventoryStats,
  MechanicAvailability,
  MechanicSearchFilters,
  MechanicSearchResult,
  ChatMessage
} from '@/types'

export class DatabaseService {
  // Activity Logging for Traceability
  static async logActivity(
    userId: string,
    activityType: ActivityType,
    description: string,
    requestId?: string,
    metadata?: Record<string, unknown>
  ): Promise<string> {
    const docRef = await addDoc(collection(db, 'activity_logs'), {
      user_id: userId,
      activity_type: activityType,
      description,
      request_id: requestId,
      metadata: metadata || {},
      timestamp: Timestamp.now().toDate().toISOString()
    })
    return docRef.id
  }

  static async getActivityLogs(requestId?: string, userId?: string): Promise<ActivityLog[]> {
    let q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'))
    
    if (requestId) {
      q = query(q, where('request_id', '==', requestId))
    }
    if (userId) {
      q = query(q, where('user_id', '==', userId))
    }
    
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ActivityLog))
  }

  // Users
  static async createUser(userData: Omit<User, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      created_at: Timestamp.now().toDate().toISOString()
    })
    return docRef.id
  }

  static async getUser(userId: string): Promise<User | null> {
    const docSnap = await getDoc(doc(db, 'users', userId))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User
    }
    return null
  }

  static async updateUser(userId: string, userData: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), userData)
  }

  static async getUsersByRole(role: string): Promise<User[]> {
    const q = query(collection(db, 'users'), where('role', '==', role))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User))
  }

  // Cars
  static async createCar(carData: Omit<Car, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'cars'), {
      ...carData,
      created_at: Timestamp.now().toDate().toISOString()
    })
    return docRef.id
  }

  static async getCar(carId: string): Promise<Car | null> {
    const docSnap = await getDoc(doc(db, 'cars', carId))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Car
    }
    return null
  }

  static async updateCar(carId: string, carData: Partial<Car>): Promise<void> {
    await updateDoc(doc(db, 'cars', carId), carData)
  }

  static async deleteCar(carId: string): Promise<void> {
    await deleteDoc(doc(db, 'cars', carId))
  }

  static async getCarsByOwner(ownerId: string): Promise<Car[]> {
    const q = query(collection(db, 'cars'), where('owner_id', '==', ownerId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car))
  }

  // Service Requests
  static async createRequest(requestData: Omit<Request, 'id'>): Promise<string> {
    const batch = writeBatch(db)
    
    // Create request
    const requestRef = doc(collection(db, 'requests'))
    const finalRequestData = {
      ...requestData,
      created_at: Timestamp.now().toDate().toISOString(),
      updated_at: Timestamp.now().toDate().toISOString()
    }
    batch.set(requestRef, finalRequestData)

    // Log activity
    const activityRef = doc(collection(db, 'activity_logs'))
    batch.set(activityRef, {
      request_id: requestRef.id,
      user_id: requestData.owner_id,
      activity_type: 'request_created',
      description: `Service request created: ${requestData.title}`,
      metadata: { urgency: requestData.urgency },
      timestamp: Timestamp.now().toDate().toISOString()
    })

    // Get all mechanics to send notifications
    try {
      const mechanicsQuery = query(
        collection(db, 'users'),
        where('role', '==', 'Mechanic')
      )
      const mechanicsSnapshot = await getDocs(mechanicsQuery)
      
      // Create database notifications for all mechanics
      mechanicsSnapshot.docs.forEach(mechanicDoc => {
        const mechanicData = mechanicDoc.data() as User
        const notificationRef = doc(collection(db, 'notifications'))
        batch.set(notificationRef, {
          user_id: mechanicData.id,
          title: 'New Service Request Available',
          message: `${requestData.title} - ${requestData.urgency.toUpperCase()} priority in ${requestData.location}`,
          type: 'request_update',
          read: false,
          timestamp: Timestamp.now().toDate().toISOString(),
          data: {
            request_id: requestRef.id,
            car_info: requestData.title,
            urgency: requestData.urgency,
            location: requestData.location,
            action: 'view_requests'
          }
        })
      })
    } catch (error) {
      console.error('Error creating mechanic notifications:', error)
      // Don't fail request creation if notifications fail
    }

    await batch.commit()
    return requestRef.id
  }

  static async claimRequest(requestId: string, mechanicId: string): Promise<void> {
    const batch = writeBatch(db)
    
    // Get original request for notifications
    const originalRequest = await this.getRequest(requestId)
    if (!originalRequest) {
      throw new Error('Request not found')
    }
    
    // Update request
    const requestRef = doc(db, 'requests', requestId)
    batch.update(requestRef, {
      mechanic_id: mechanicId,
      status: 'claimed',
      updated_at: Timestamp.now().toDate().toISOString()
    })

    // Log activity
    const activityRef = doc(collection(db, 'activity_logs'))
    batch.set(activityRef, {
      request_id: requestId,
      user_id: mechanicId,
      activity_type: 'request_claimed',
      description: 'Request claimed by mechanic',
      timestamp: Timestamp.now().toDate().toISOString()
    })

    // Create notification for car owner
    const notificationRef = doc(collection(db, 'notifications'))
    batch.set(notificationRef, {
      user_id: originalRequest.owner_id,
      title: 'Service Request Claimed',
      message: 'A mechanic has claimed your service request and will contact you soon.',
      type: 'request_update',
      read: false,
      timestamp: Timestamp.now().toDate().toISOString(),
      data: {
        request_id: requestId,
        status: 'claimed'
      }
    })

    await batch.commit()

    // Send FCM notification to car owner
    try {
      const [mechanic, car] = await Promise.all([
        this.getUser(mechanicId),
        originalRequest.car_id ? this.getCar(originalRequest.car_id) : null
      ])

      const carInfo = car ? `${car.make} ${car.model}` : 'your vehicle'
      
      // Dynamically import FCMService to avoid circular dependency
      const { FCMService } = await import('./fcm')
      await FCMService.sendStatusUpdateToOwner(originalRequest.owner_id, {
        requestId,
        status: 'claimed',
        carInfo,
        mechanicName: mechanic?.name,
        message: `${mechanic?.name || 'A mechanic'} has claimed your ${carInfo} service request`
      })
    } catch (error) {
      console.error('Error sending claim notification:', error)
    }
  }

  static async getRequest(requestId: string): Promise<Request | null> {
    const docSnap = await getDoc(doc(db, 'requests', requestId))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Request
    }
    return null
  }

  static async updateRequest(requestId: string, requestData: Partial<Request>, userId?: string): Promise<void> {
    const batch = writeBatch(db)
    
    // Get original request to send notifications
    const originalRequest = await this.getRequest(requestId)
    if (!originalRequest) {
      throw new Error('Request not found')
    }

    // Update request
    const requestRef = doc(db, 'requests', requestId)
    batch.update(requestRef, {
      ...requestData,
      updated_at: Timestamp.now().toDate().toISOString()
    })

    // Log activity if status changed
    if (requestData.status && userId) {
      const activityRef = doc(collection(db, 'activity_logs'))
      batch.set(activityRef, {
        request_id: requestId,
        user_id: userId,
        activity_type: this.getActivityTypeFromStatus(requestData.status),
        description: `Request status updated to: ${requestData.status}`,
        metadata: requestData,
        timestamp: Timestamp.now().toDate().toISOString()
      })

      // Create notification for car owner about status update
      if (userId !== originalRequest.owner_id) {
        const notificationRef = doc(collection(db, 'notifications'))
        batch.set(notificationRef, {
          user_id: originalRequest.owner_id,
          title: 'Service Request Update',
          message: `Your service request status has been updated to: ${requestData.status?.replace('_', ' ').toUpperCase()}`,
          type: 'request_update',
          read: false,
          timestamp: Timestamp.now().toDate().toISOString(),
          data: {
            request_id: requestId,
            status: requestData.status,
            mechanic_name: userId ? (await this.getUser(userId))?.name : undefined
          }
        })
      }
    }

    await batch.commit()

    // Send FCM notification for status updates
    if (requestData.status && userId && userId !== originalRequest.owner_id) {
      try {
        const [car, mechanic] = await Promise.all([
          originalRequest.car_id ? this.getCar(originalRequest.car_id) : null,
          userId ? this.getUser(userId) : null
        ])

        const carInfo = car ? `${car.make} ${car.model}` : 'Your vehicle'
        
        // Dynamically import FCMService to avoid circular dependency
        const { FCMService } = await import('./fcm')
        await FCMService.sendStatusUpdateToOwner(originalRequest.owner_id, {
          requestId,
          status: requestData.status,
          carInfo,
          mechanicName: mechanic?.name,
          message: `${carInfo} service status: ${requestData.status.replace('_', ' ').toUpperCase()}`
        })
      } catch (error) {
        console.error('Error sending status update notification:', error)
      }
    }
  }

  private static getActivityTypeFromStatus(status: string): ActivityType {
    const statusMap: Record<string, ActivityType> = {
      'in_progress': 'work_started',
      'completed': 'work_completed',
      'quoted': 'quote_approved',
      'parts_requested': 'parts_requested',
      'parts_received': 'parts_received'
    }
    return statusMap[status] || 'request_created'
  }

  static async deleteRequest(requestId: string): Promise<void> {
    await deleteDoc(doc(db, 'requests', requestId))
  }

  static async getRequestsByOwner(ownerId: string): Promise<Request[]> {
    const q = query(
      collection(db, 'requests'), 
      where('owner_id', '==', ownerId)
    )
    const querySnapshot = await getDocs(q)
    const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request))
    
    // Populate car and mechanic information for each request
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const car = await this.getCar(request.car_id)
        let mechanic = undefined
        if (request.mechanic_id) {
          mechanic = await this.getUser(request.mechanic_id)
        }
        
        return {
          ...request,
          car: car || undefined,
          mechanic: mechanic || undefined
        }
      })
    )
    
    // Sort in memory to avoid index requirement
    return requestsWithDetails.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime()
      const bTime = new Date(b.created_at || 0).getTime()
      return bTime - aTime // desc order
    })
  }

  static async getRequestsByMechanic(mechanicId: string): Promise<Request[]> {
    const q = query(
      collection(db, 'requests'), 
      where('mechanic_id', '==', mechanicId)
    )
    const querySnapshot = await getDocs(q)
    const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request))
    
    // Populate car and owner information for each request
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const [car, owner] = await Promise.all([
          this.getCar(request.car_id),
          this.getUser(request.owner_id)
        ])
        
        return {
          ...request,
          car: car || undefined,
          owner: owner || undefined
        }
      })
    )
    
    // Sort in memory to avoid index requirement
    return requestsWithDetails.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime()
      const bTime = new Date(b.created_at || 0).getTime()
      return bTime - aTime // desc order
    })
  }

  static async getAvailableRequests(): Promise<Request[]> {
    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'pending')
    )
    const querySnapshot = await getDocs(q)
    const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request))
    
    // Populate car and owner information for each request
    const requestsWithDetails = await Promise.all(
      requests.map(async (request) => {
        const [car, owner] = await Promise.all([
          this.getCar(request.car_id),
          this.getUser(request.owner_id)
        ])
        
        return {
          ...request,
          car: car || undefined,
          owner: owner || undefined
        }
      })
    )
    
    // Sort in memory to avoid index requirement
    return requestsWithDetails.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime()
      const bTime = new Date(b.created_at || 0).getTime()
      return bTime - aTime // desc order
    })
  }

  // Diagnoses
  static async createDiagnosis(diagnosisData: Omit<Diagnosis, 'id'>): Promise<string> {
    const batch = writeBatch(db)
    
    // Create diagnosis
    const diagnosisRef = doc(collection(db, 'diagnoses'))
    batch.set(diagnosisRef, {
      ...diagnosisData,
      created_at: Timestamp.now().toDate().toISOString()
    })

    // Update request status
    const requestRef = doc(db, 'requests', diagnosisData.request_id)
    batch.update(requestRef, {
      status: 'diagnosed',
      updated_at: Timestamp.now().toDate().toISOString()
    })

    // Log activity
    const activityRef = doc(collection(db, 'activity_logs'))
    batch.set(activityRef, {
      request_id: diagnosisData.request_id,
      user_id: diagnosisData.mechanic_id,
      activity_type: 'diagnosis_submitted',
      description: `Diagnosis submitted: ${diagnosisData.title}`,
      metadata: { severity: diagnosisData.severity, estimated_cost: diagnosisData.estimated_cost },
      timestamp: Timestamp.now().toDate().toISOString()
    })

    await batch.commit()
    return diagnosisRef.id
  }

  static async getDiagnosis(diagnosisId: string): Promise<Diagnosis | null> {
    const docSnap = await getDoc(doc(db, 'diagnoses', diagnosisId))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Diagnosis
    }
    return null
  }

  static async updateDiagnosis(diagnosisId: string, diagnosisData: Partial<Diagnosis>): Promise<void> {
    await updateDoc(doc(db, 'diagnoses', diagnosisId), {
      ...diagnosisData,
      updated_at: Timestamp.now().toDate().toISOString()
    })
  }

  static async deleteDiagnosis(diagnosisId: string): Promise<void> {
    await deleteDoc(doc(db, 'diagnoses', diagnosisId))
  }

  static async getDiagnosesByRequest(requestId: string): Promise<Diagnosis[]> {
    const q = query(collection(db, 'diagnoses'), where('request_id', '==', requestId))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diagnosis))
  }

  static async getDiagnosesByMechanic(mechanicId: string): Promise<Diagnosis[]> {
    const q = query(
      collection(db, 'diagnoses'), 
      where('mechanic_id', '==', mechanicId)
    )
    const querySnapshot = await getDocs(q)
    const diagnoses = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Diagnosis))
    
    // Sort in memory to avoid index requirement
    return diagnoses.sort((a, b) => {
      const aTime = new Date(a.created_at || 0).getTime()
      const bTime = new Date(b.created_at || 0).getTime()
      return bTime - aTime // desc order
    })
  }

  // Parts Management
  static async createPart(partData: Omit<Part, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'parts'), {
      ...partData,
      is_active: true,
      created_at: Timestamp.now().toDate().toISOString()
    })
    return docRef.id
  }

  static async getPart(partId: string): Promise<Part | null> {
    const docSnap = await getDoc(doc(db, 'parts', partId))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Part
    }
    return null
  }

  static async updatePart(partId: string, partData: Partial<Part>): Promise<void> {
    await updateDoc(doc(db, 'parts', partId), {
      ...partData,
      updated_at: Timestamp.now().toDate().toISOString()
    })
  }

  static async deletePart(partId: string): Promise<void> {
    await updateDoc(doc(db, 'parts', partId), { is_active: false })
  }

  static async getPartsByDealer(dealerId: string): Promise<Part[]> {
    const q = query(
      collection(db, 'parts'), 
      where('dealer_id', '==', dealerId),
      where('is_active', '==', true),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Part))
  }

  static async getAllParts(limitCount?: number): Promise<Part[]> {
    let q = query(
      collection(db, 'parts'), 
      where('is_active', '==', true),
      orderBy('created_at', 'desc')
    )
    if (limitCount) {
      q = query(q, limit(limitCount))
    }
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Part))
  }

  static async searchParts(searchTerm: string, category?: string): Promise<Part[]> {
    let q = query(
      collection(db, 'parts'),
      where('is_active', '==', true)
    )
    
    if (category) {
      q = query(q, where('category', '==', category))
    }
    
    const querySnapshot = await getDocs(q)
    const allParts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Part))
    
    return allParts.filter(part => 
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.brand?.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }

  static async getLowStockParts(dealerId: string): Promise<Part[]> {
    const q = query(
      collection(db, 'parts'),
      where('dealer_id', '==', dealerId),
      where('is_active', '==', true)
    )
    const querySnapshot = await getDocs(q)
    const parts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Part))
    
    return parts.filter(part => 
      part.stock <= (part.min_stock_threshold || 5)
    )
  }

  // Transactions
  static async createTransaction(transactionData: Omit<Transaction, 'id'>): Promise<string> {
    const batch = writeBatch(db)
    
    // Create transaction
    const transactionRef = doc(collection(db, 'transactions'))
    batch.set(transactionRef, {
      ...transactionData,
      created_at: Timestamp.now().toDate().toISOString(),
      updated_at: Timestamp.now().toDate().toISOString()
    })

    // Log activity
    const activityRef = doc(collection(db, 'activity_logs'))
    batch.set(activityRef, {
      request_id: transactionData.request_id,
      user_id: transactionData.mechanic_id,
      activity_type: 'parts_requested',
      description: `Parts requested from dealer`,
      metadata: { 
        part_id: transactionData.part_id, 
        quantity: transactionData.quantity,
        total_amount: transactionData.total_amount
      },
      timestamp: Timestamp.now().toDate().toISOString()
    })

    await batch.commit()
    return transactionRef.id
  }

  static async approveTransaction(transactionId: string, dealerId: string): Promise<void> {
    const batch = writeBatch(db)
    
    // Update transaction
    const transactionRef = doc(db, 'transactions', transactionId)
    batch.update(transactionRef, {
      status: 'approved',
      approved_at: Timestamp.now().toDate().toISOString(),
      updated_at: Timestamp.now().toDate().toISOString()
    })

    // Get transaction to get request info
    const transactionSnap = await getDoc(transactionRef)
    const transaction = transactionSnap.data() as Transaction

    // Update part stock
    const partRef = doc(db, 'parts', transaction.part_id)
    batch.update(partRef, {
      stock: increment(-transaction.quantity)
    })

    // Log activity
    const activityRef = doc(collection(db, 'activity_logs'))
    batch.set(activityRef, {
      request_id: transaction.request_id,
      user_id: dealerId,
      activity_type: 'parts_approved',
      description: `Parts request approved by dealer`,
      metadata: { transaction_id: transactionId },
      timestamp: Timestamp.now().toDate().toISOString()
    })

    await batch.commit()
  }

  static async completeTransaction(transactionId: string): Promise<void> {
    await updateDoc(doc(db, 'transactions', transactionId), {
      status: 'completed',
      completed_at: Timestamp.now().toDate().toISOString(),
      updated_at: Timestamp.now().toDate().toISOString()
    })
  }

  static async getTransaction(transactionId: string): Promise<Transaction | null> {
    const docSnap = await getDoc(doc(db, 'transactions', transactionId))
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Transaction
    }
    return null
  }

  static async updateTransaction(transactionId: string, transactionData: Partial<Transaction>): Promise<void> {
    await updateDoc(doc(db, 'transactions', transactionId), {
      ...transactionData,
      updated_at: Timestamp.now().toDate().toISOString()
    })
  }

  static async getTransactionsByDealer(dealerId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('dealer_id', '==', dealerId),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
  }

  static async getTransactionsByMechanic(mechanicId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('mechanic_id', '==', mechanicId),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
  }

  static async getPendingTransactions(dealerId: string): Promise<Transaction[]> {
    const q = query(
      collection(db, 'transactions'),
      where('dealer_id', '==', dealerId),
      where('status', '==', 'pending'),
      orderBy('created_at', 'desc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
  }

  // Maintenance Records
  static async createMaintenanceRecord(recordData: Omit<MaintenanceRecord, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'maintenance_records'), {
      ...recordData,
      created_at: Timestamp.now().toDate().toISOString()
    })
    return docRef.id
  }

  static async getMaintenanceRecordsByMechanic(mechanicId: string): Promise<MaintenanceRecord[]> {
    const q = query(
      collection(db, 'maintenance_records'),
      where('mechanic_id', '==', mechanicId)
    )
    const querySnapshot = await getDocs(q)
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceRecord))
    
    // Sort in memory to avoid index requirement
    return records.sort((a, b) => {
      const aTime = new Date(a.maintenance_date || 0).getTime()
      const bTime = new Date(b.maintenance_date || 0).getTime()
      return bTime - aTime // desc order
    })
  }

  static async getMaintenanceRecordsByCar(carId: string): Promise<MaintenanceRecord[]> {
    const q = query(
      collection(db, 'maintenance_records'),
      where('car_id', '==', carId)
    )
    const querySnapshot = await getDocs(q)
    const records = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MaintenanceRecord))
    
    // Sort in memory to avoid index requirement
    return records.sort((a, b) => {
      const aTime = new Date(a.maintenance_date || 0).getTime()
      const bTime = new Date(b.maintenance_date || 0).getTime()
      return bTime - aTime // desc order
    })
  }

  // Statistics
  static async getMechanicStats(mechanicId: string): Promise<MechanicStats> {
    const [availableRequests, activeJobs, completedJobs, earnings] = await Promise.all([
      this.getAvailableRequests(),
      this.getRequestsByMechanic(mechanicId).then(requests => 
        requests.filter(r => ['claimed', 'diagnosed', 'in_progress', 'parts_requested'].includes(r.status))
      ),
      this.getRequestsByMechanic(mechanicId).then(requests => 
        requests.filter(r => r.status === 'completed')
      ),
      this.getMaintenanceRecordsByMechanic(mechanicId).then(records =>
        records.reduce((sum, record) => sum + record.total_cost, 0)
      )
    ])

    return {
      available_requests: availableRequests.length,
      active_jobs: activeJobs.length,
      completed_jobs: completedJobs.length,
      total_earnings: earnings,
      average_rating: 4.8 // TODO: Implement rating system
    }
  }

  static async getInventoryStats(dealerId: string): Promise<InventoryStats> {
    const [parts, transactions, lowStockParts] = await Promise.all([
      this.getPartsByDealer(dealerId),
      this.getTransactionsByDealer(dealerId),
      this.getLowStockParts(dealerId)
    ])

    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.created_at)
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear &&
             t.status === 'completed'
    })

    const monthlyRevenue = monthlyTransactions.reduce((sum, t) => sum + t.total_amount, 0)
    const pendingOrders = transactions.filter(t => t.status === 'pending').length

    return {
      total_parts: parts.length,
      low_stock_items: lowStockParts.length,
      pending_orders: pendingOrders,
      monthly_sales: monthlyTransactions.length,
      monthly_revenue: monthlyRevenue
    }
  }

  // Notifications
  static async createNotification(notificationData: Omit<NotificationData, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      timestamp: Timestamp.now().toDate().toISOString()
    })
    return docRef.id
  }

  static async getNotificationsByUser(userId: string): Promise<NotificationData[]> {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId)
    )
    const querySnapshot = await getDocs(q)
    const notifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationData))
    
    // Sort in memory to avoid index requirement
    return notifications.sort((a, b) => {
      const aTime = new Date(a.timestamp || 0).getTime()
      const bTime = new Date(b.timestamp || 0).getTime()
      return bTime - aTime // desc order
    })
  }

  static async markNotificationAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), { read: true })
  }

  // Real-time subscriptions
  static subscribeToUserRequests(userId: string, callback: (requests: Request[]) => void) {
    const q = query(
      collection(db, 'requests'),
      where('owner_id', '==', userId)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request))
      // Sort in memory to avoid index requirement
      const sortedRequests = requests.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime()
        const bTime = new Date(b.created_at || 0).getTime()
        return bTime - aTime // desc order
      })
      callback(sortedRequests)
    })
  }

  static subscribeToMechanicRequests(mechanicId: string, callback: (requests: Request[]) => void) {
    const q = query(
      collection(db, 'requests'),
      where('mechanic_id', '==', mechanicId)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request))
      // Sort in memory to avoid index requirement  
      const sortedRequests = requests.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime()
        const bTime = new Date(b.created_at || 0).getTime()
        return bTime - aTime // desc order
      })
      callback(sortedRequests)
    })
  }

  static subscribeToAvailableRequests(callback: (requests: Request[]) => void) {
    const q = query(
      collection(db, 'requests'),
      where('status', '==', 'pending')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const requests = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Request))
      // Sort in memory to avoid index requirement
      const sortedRequests = requests.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime()
        const bTime = new Date(b.created_at || 0).getTime()
        return bTime - aTime // desc order
      })
      callback(sortedRequests)
    })
  }

  static subscribeToPendingTransactions(dealerId: string, callback: (transactions: Transaction[]) => void) {
    const q = query(
      collection(db, 'transactions'),
      where('dealer_id', '==', dealerId),
      where('status', '==', 'pending')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const transactions = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction))
      // Sort in memory to avoid index requirement
      const sortedTransactions = transactions.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime()
        const bTime = new Date(b.created_at || 0).getTime()
        return bTime - aTime // desc order
      })
      callback(sortedTransactions)
    })
  }

  static subscribeToUserNotifications(userId: string, callback: (notifications: NotificationData[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('user_id', '==', userId),
      where('read', '==', false)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as NotificationData))
      // Sort in memory to avoid index requirement
      const sortedNotifications = notifications.sort((a, b) => {
        const aTime = new Date(a.timestamp || 0).getTime()
        const bTime = new Date(b.timestamp || 0).getTime()
        return bTime - aTime // desc order
      })
      callback(sortedNotifications)
    })
  }

  static subscribeToUserCars(userId: string, callback: (cars: Car[]) => void) {
    const q = query(
      collection(db, 'cars'),
      where('owner_id', '==', userId)
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const cars = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Car))
      // Sort in memory to avoid index requirement
      const sortedCars = cars.sort((a, b) => {
        const aTime = new Date(a.created_at || 0).getTime()
        const bTime = new Date(b.created_at || 0).getTime()
        return bTime - aTime // desc order
      })
      callback(sortedCars)
    })
  }

  // Mechanic Availability Management
  static async createOrUpdateMechanicAvailability(availabilityData: Omit<MechanicAvailability, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    // Check if availability already exists for this mechanic
    const q = query(collection(db, 'mechanic_availability'), where('mechanic_id', '==', availabilityData.mechanic_id))
    const existingSnapshot = await getDocs(q)
    
    if (!existingSnapshot.empty) {
      // Update existing availability
      const existingDoc = existingSnapshot.docs[0]
      await updateDoc(existingDoc.ref, {
        ...availabilityData,
        updated_at: Timestamp.now().toDate().toISOString()
      })
      return existingDoc.id
    } else {
      // Create new availability
      const docRef = await addDoc(collection(db, 'mechanic_availability'), {
        ...availabilityData,
        created_at: Timestamp.now().toDate().toISOString(),
        updated_at: Timestamp.now().toDate().toISOString()
      })
      return docRef.id
    }
  }

  static async getMechanicAvailability(mechanicId: string): Promise<MechanicAvailability | null> {
    const q = query(collection(db, 'mechanic_availability'), where('mechanic_id', '==', mechanicId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0]
      return { id: doc.id, ...doc.data() } as MechanicAvailability
    }
    return null
  }

  static async updateMechanicAvailabilityStatus(mechanicId: string, isAvailable: boolean): Promise<void> {
    const q = query(collection(db, 'mechanic_availability'), where('mechanic_id', '==', mechanicId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const docRef = querySnapshot.docs[0].ref
      await updateDoc(docRef, {
        is_available: isAvailable,
        updated_at: Timestamp.now().toDate().toISOString()
      })
    }
  }

  static async searchAvailableMechanics(filters: MechanicSearchFilters): Promise<MechanicSearchResult[]> {
    let q = query(collection(db, 'mechanic_availability'), where('is_available', '==', true))
    
    // Apply basic filters
    if (filters.emergency_service) {
      q = query(q, where('emergency_service', '==', true))
    }
    
    if (filters.max_hourly_rate) {
      q = query(q, where('hourly_rate', '<=', filters.max_hourly_rate))
    }
    
    const querySnapshot = await getDocs(q)
    const mechanics = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as MechanicAvailability))
    
    // Get mechanic details and stats
    const mechanicsWithDetails = await Promise.all(
      mechanics.map(async (mechanic) => {
        const [mechanicUser, stats, activeRequests] = await Promise.all([
          this.getUser(mechanic.mechanic_id),
          this.getMechanicStats(mechanic.mechanic_id),
          this.getRequestsByMechanic(mechanic.mechanic_id).then(requests => 
            requests.filter(r => ['claimed', 'diagnosed', 'in_progress', 'parts_requested'].includes(r.status))
          )
        ])
        
        const isCurrentlyAvailable = mechanic.is_available && 
                                   activeRequests.length < mechanic.max_concurrent_jobs &&
                                   this.isWithinWorkingHours(mechanic.working_hours)
        
        let distance: number | undefined
        let estimatedArrival: string | undefined
        
        if (filters.location) {
          distance = this.calculateDistance(
            filters.location.lat,
            filters.location.lng,
            mechanic.base_location.lat,
            mechanic.base_location.lng
          )
          
          if (distance <= (filters.location.radius || mechanic.service_radius)) {
            estimatedArrival = this.calculateEstimatedArrival(distance)
          } else {
            return null // Outside service radius
          }
        }
        
        return {
          ...mechanic,
          mechanic: mechanicUser,
          distance,
          estimated_arrival: estimatedArrival,
          total_rating: stats.average_rating,
          completed_jobs: stats.completed_jobs,
          is_currently_available: isCurrentlyAvailable,
          current_active_jobs: activeRequests.length
        } as MechanicSearchResult
      })
    )
    
    // Filter out null results and apply additional filters
    let results = mechanicsWithDetails.filter((m): m is MechanicSearchResult => m !== null)
    
    if (filters.specializations && filters.specializations.length > 0) {
      results = results.filter(m => 
        filters.specializations!.some(spec => 
          m.specializations.some(mechSpec => 
            mechSpec.toLowerCase().includes(spec.toLowerCase())
          )
        )
      )
    }
    
    if (filters.rating_min) {
      results = results.filter(m => m.total_rating >= filters.rating_min!)
    }
    
    if (filters.availability_now) {
      results = results.filter(m => m.is_currently_available)
    }
    
    // Sort by distance (if location provided) and rating
    results.sort((a, b) => {
      if (a.distance !== undefined && b.distance !== undefined) {
        const distanceDiff = a.distance - b.distance
        if (distanceDiff !== 0) return distanceDiff
      }
      return b.total_rating - a.total_rating
    })
    
    return results
  }

  private static isWithinWorkingHours(workingHours: MechanicAvailability['working_hours']): boolean {
    const now = new Date()
    const currentDay = now.getDay()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    if (!workingHours.days.includes(currentDay)) {
      return false
    }
    
    const [startHour, startMin] = workingHours.start.split(':').map(Number)
    const [endHour, endMin] = workingHours.end.split(':').map(Number)
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin
    
    return currentTime >= startTime && currentTime <= endTime
  }

  private static calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371 // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  private static calculateEstimatedArrival(distance: number): string {
    // Assume 30 km/h average speed in city
    const minutes = Math.round((distance / 30) * 60)
    if (minutes < 60) {
      return `${minutes} minutes`
    } else {
      const hours = Math.floor(minutes / 60)
      const remainingMinutes = minutes % 60
      return `${hours}h ${remainingMinutes}m`
    }
  }

  // Enhanced request creation with direct mechanic assignment
  static async createDirectRequest(requestData: Omit<Request, 'id'>, mechanicId?: string): Promise<string> {
    const batch = writeBatch(db)
    
    // Create request
    const requestRef = doc(collection(db, 'requests'))
    const finalRequestData = {
      ...requestData,
      mechanic_id: mechanicId || null,
      status: mechanicId ? 'claimed' : 'pending',
      created_at: Timestamp.now().toDate().toISOString(),
      updated_at: Timestamp.now().toDate().toISOString()
    }
    
    batch.set(requestRef, finalRequestData)

    // Log activity
    const activityRef = doc(collection(db, 'activity_logs'))
    batch.set(activityRef, {
      request_id: requestRef.id,
      user_id: requestData.owner_id,
      activity_type: mechanicId ? 'request_claimed' : 'request_created',
      description: mechanicId 
        ? `Service request assigned to mechanic: ${requestData.title}`
        : `Service request created: ${requestData.title}`,
      metadata: { urgency: requestData.urgency, mechanic_id: mechanicId },
      timestamp: Timestamp.now().toDate().toISOString()
    })

    // If assigned to mechanic, create notification
    if (mechanicId) {
      const notificationRef = doc(collection(db, 'notifications'))
      batch.set(notificationRef, {
        user_id: mechanicId,
        title: 'New Service Request Assigned',
        message: `You have been assigned a new service request: ${requestData.title}`,
        type: 'request_update',
        read: false,
        timestamp: Timestamp.now().toDate().toISOString(),
        data: {
          request_id: requestRef.id,
          car_info: requestData.title,
          urgency: requestData.urgency
        }
      })
    }

    await batch.commit()
    return requestRef.id
  }

  // Chat Messaging
  static async sendMessage(messageData: Omit<ChatMessage, 'id' | 'timestamp'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'chat_messages'), {
      ...messageData,
      timestamp: Timestamp.now().toDate().toISOString()
    })
    return docRef.id
  }

  static async getMessages(requestId: string): Promise<ChatMessage[]> {
    const q = query(
      collection(db, 'chat_messages'),
      where('request_id', '==', requestId),
      orderBy('timestamp', 'asc')
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
  }

  static async markMessageAsRead(messageId: string, userId: string): Promise<void> {
    const messageRef = doc(db, 'chat_messages', messageId)
    const messageSnap = await getDoc(messageRef)
    
    if (messageSnap.exists()) {
      const messageData = messageSnap.data() as ChatMessage
      const updatedReadBy = Array.from(new Set([...messageData.read_by, userId]))
      
      await updateDoc(messageRef, {
        read_by: updatedReadBy
      })
    }
  }

  static subscribeToMessages(requestId: string, callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, 'chat_messages'),
      where('request_id', '==', requestId),
      orderBy('timestamp', 'asc')
    )
    
    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
      callback(messages)
    })
  }

  static async getUnreadMessageCount(requestId: string, userId: string): Promise<number> {
    const q = query(
      collection(db, 'chat_messages'),
      where('request_id', '==', requestId)
    )
    const querySnapshot = await getDocs(q)
    const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ChatMessage))
    
    return messages.filter(msg => 
      msg.sender_id !== userId && !msg.read_by.includes(userId)
    ).length
  }
} 