//
// DO NOT EDIT.
//
// Generated by the protocol buffer compiler.
// Source: enrollments.proto
//

//
// Copyright 2018, gRPC Authors All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
import Foundation
import Dispatch
import SwiftGRPC
import SwiftProtobuf

public protocol Soseedy_SeedyEnrollmentsCreateEnrollmentTermCall: ClientCallUnary {}

fileprivate final class Soseedy_SeedyEnrollmentsCreateEnrollmentTermCallBase: ClientCallUnaryBase<Soseedy_CreateEnrollmentTermRequest, Soseedy_EnrollmentTerm>, Soseedy_SeedyEnrollmentsCreateEnrollmentTermCall {
  override class var method: String { return "/soseedy.SeedyEnrollments/CreateEnrollmentTerm" }
}

public protocol Soseedy_SeedyEnrollmentsEnrollUserInCourseCall: ClientCallUnary {}

fileprivate final class Soseedy_SeedyEnrollmentsEnrollUserInCourseCallBase: ClientCallUnaryBase<Soseedy_EnrollUserRequest, Soseedy_Enrollment>, Soseedy_SeedyEnrollmentsEnrollUserInCourseCall {
  override class var method: String { return "/soseedy.SeedyEnrollments/EnrollUserInCourse" }
}

public protocol Soseedy_SeedyEnrollmentsEnrollUserInSectionCall: ClientCallUnary {}

fileprivate final class Soseedy_SeedyEnrollmentsEnrollUserInSectionCallBase: ClientCallUnaryBase<Soseedy_EnrollUserInSectionRequest, Soseedy_Enrollment>, Soseedy_SeedyEnrollmentsEnrollUserInSectionCall {
  override class var method: String { return "/soseedy.SeedyEnrollments/EnrollUserInSection" }
}


/// Instantiate Soseedy_SeedyEnrollmentsServiceClient, then call methods of this protocol to make API calls.
public protocol Soseedy_SeedyEnrollmentsService: ServiceClient {
  /// Synchronous. Unary.
  func createEnrollmentTerm(_ request: Soseedy_CreateEnrollmentTermRequest) throws -> Soseedy_EnrollmentTerm
  /// Asynchronous. Unary.
  func createEnrollmentTerm(_ request: Soseedy_CreateEnrollmentTermRequest, completion: @escaping (Soseedy_EnrollmentTerm?, CallResult) -> Void) throws -> Soseedy_SeedyEnrollmentsCreateEnrollmentTermCall

  /// Synchronous. Unary.
  func enrollUserInCourse(_ request: Soseedy_EnrollUserRequest) throws -> Soseedy_Enrollment
  /// Asynchronous. Unary.
  func enrollUserInCourse(_ request: Soseedy_EnrollUserRequest, completion: @escaping (Soseedy_Enrollment?, CallResult) -> Void) throws -> Soseedy_SeedyEnrollmentsEnrollUserInCourseCall

  /// Synchronous. Unary.
  func enrollUserInSection(_ request: Soseedy_EnrollUserInSectionRequest) throws -> Soseedy_Enrollment
  /// Asynchronous. Unary.
  func enrollUserInSection(_ request: Soseedy_EnrollUserInSectionRequest, completion: @escaping (Soseedy_Enrollment?, CallResult) -> Void) throws -> Soseedy_SeedyEnrollmentsEnrollUserInSectionCall

}

public final class Soseedy_SeedyEnrollmentsServiceClient: ServiceClientBase, Soseedy_SeedyEnrollmentsService {
  /// Synchronous. Unary.
  public func createEnrollmentTerm(_ request: Soseedy_CreateEnrollmentTermRequest) throws -> Soseedy_EnrollmentTerm {
    return try Soseedy_SeedyEnrollmentsCreateEnrollmentTermCallBase(channel)
      .run(request: request, metadata: metadata)
  }
  /// Asynchronous. Unary.
  public func createEnrollmentTerm(_ request: Soseedy_CreateEnrollmentTermRequest, completion: @escaping (Soseedy_EnrollmentTerm?, CallResult) -> Void) throws -> Soseedy_SeedyEnrollmentsCreateEnrollmentTermCall {
    return try Soseedy_SeedyEnrollmentsCreateEnrollmentTermCallBase(channel)
      .start(request: request, metadata: metadata, completion: completion)
  }

  /// Synchronous. Unary.
  public func enrollUserInCourse(_ request: Soseedy_EnrollUserRequest) throws -> Soseedy_Enrollment {
    return try Soseedy_SeedyEnrollmentsEnrollUserInCourseCallBase(channel)
      .run(request: request, metadata: metadata)
  }
  /// Asynchronous. Unary.
  public func enrollUserInCourse(_ request: Soseedy_EnrollUserRequest, completion: @escaping (Soseedy_Enrollment?, CallResult) -> Void) throws -> Soseedy_SeedyEnrollmentsEnrollUserInCourseCall {
    return try Soseedy_SeedyEnrollmentsEnrollUserInCourseCallBase(channel)
      .start(request: request, metadata: metadata, completion: completion)
  }

  /// Synchronous. Unary.
  public func enrollUserInSection(_ request: Soseedy_EnrollUserInSectionRequest) throws -> Soseedy_Enrollment {
    return try Soseedy_SeedyEnrollmentsEnrollUserInSectionCallBase(channel)
      .run(request: request, metadata: metadata)
  }
  /// Asynchronous. Unary.
  public func enrollUserInSection(_ request: Soseedy_EnrollUserInSectionRequest, completion: @escaping (Soseedy_Enrollment?, CallResult) -> Void) throws -> Soseedy_SeedyEnrollmentsEnrollUserInSectionCall {
    return try Soseedy_SeedyEnrollmentsEnrollUserInSectionCallBase(channel)
      .start(request: request, metadata: metadata, completion: completion)
  }

}

/// To build a server, implement a class that conforms to this protocol.
public protocol Soseedy_SeedyEnrollmentsProvider {
  func createEnrollmentTerm(request: Soseedy_CreateEnrollmentTermRequest, session: Soseedy_SeedyEnrollmentsCreateEnrollmentTermSession) throws -> Soseedy_EnrollmentTerm
  func enrollUserInCourse(request: Soseedy_EnrollUserRequest, session: Soseedy_SeedyEnrollmentsEnrollUserInCourseSession) throws -> Soseedy_Enrollment
  func enrollUserInSection(request: Soseedy_EnrollUserInSectionRequest, session: Soseedy_SeedyEnrollmentsEnrollUserInSectionSession) throws -> Soseedy_Enrollment
}

public protocol Soseedy_SeedyEnrollmentsCreateEnrollmentTermSession: ServerSessionUnary {}

fileprivate final class Soseedy_SeedyEnrollmentsCreateEnrollmentTermSessionBase: ServerSessionUnaryBase<Soseedy_CreateEnrollmentTermRequest, Soseedy_EnrollmentTerm>, Soseedy_SeedyEnrollmentsCreateEnrollmentTermSession {}

public protocol Soseedy_SeedyEnrollmentsEnrollUserInCourseSession: ServerSessionUnary {}

fileprivate final class Soseedy_SeedyEnrollmentsEnrollUserInCourseSessionBase: ServerSessionUnaryBase<Soseedy_EnrollUserRequest, Soseedy_Enrollment>, Soseedy_SeedyEnrollmentsEnrollUserInCourseSession {}

public protocol Soseedy_SeedyEnrollmentsEnrollUserInSectionSession: ServerSessionUnary {}

fileprivate final class Soseedy_SeedyEnrollmentsEnrollUserInSectionSessionBase: ServerSessionUnaryBase<Soseedy_EnrollUserInSectionRequest, Soseedy_Enrollment>, Soseedy_SeedyEnrollmentsEnrollUserInSectionSession {}


/// Main server for generated service
public final class Soseedy_SeedyEnrollmentsServer: ServiceServer {
  private let provider: Soseedy_SeedyEnrollmentsProvider

  public init(address: String, provider: Soseedy_SeedyEnrollmentsProvider) {
    self.provider = provider
    super.init(address: address)
  }

  public init?(address: String, certificateURL: URL, keyURL: URL, provider: Soseedy_SeedyEnrollmentsProvider) {
    self.provider = provider
    super.init(address: address, certificateURL: certificateURL, keyURL: keyURL)
  }

  public init?(address: String, certificateString: String, keyString: String, provider: Soseedy_SeedyEnrollmentsProvider) {
    self.provider = provider
    super.init(address: address, certificateString: certificateString, keyString: keyString)
  }

  /// Start the server.
  public override func handleMethod(_ method: String, handler: Handler, queue: DispatchQueue) throws -> Bool {
    let provider = self.provider
    switch method {
    case "/soseedy.SeedyEnrollments/CreateEnrollmentTerm":
      try Soseedy_SeedyEnrollmentsCreateEnrollmentTermSessionBase(
        handler: handler,
        providerBlock: { try provider.createEnrollmentTerm(request: $0, session: $1 as! Soseedy_SeedyEnrollmentsCreateEnrollmentTermSessionBase) })
          .run(queue: queue)
      return true
    case "/soseedy.SeedyEnrollments/EnrollUserInCourse":
      try Soseedy_SeedyEnrollmentsEnrollUserInCourseSessionBase(
        handler: handler,
        providerBlock: { try provider.enrollUserInCourse(request: $0, session: $1 as! Soseedy_SeedyEnrollmentsEnrollUserInCourseSessionBase) })
          .run(queue: queue)
      return true
    case "/soseedy.SeedyEnrollments/EnrollUserInSection":
      try Soseedy_SeedyEnrollmentsEnrollUserInSectionSessionBase(
        handler: handler,
        providerBlock: { try provider.enrollUserInSection(request: $0, session: $1 as! Soseedy_SeedyEnrollmentsEnrollUserInSectionSessionBase) })
          .run(queue: queue)
      return true
    default:
      return false
    }
  }
}
